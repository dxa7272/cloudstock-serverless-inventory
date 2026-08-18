import boto3
import json
import uuid
import logging
import os

from decimal import Decimal
from datetime import datetime, timezone
from botocore.exceptions import ClientError


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")
dynamodb_client = boto3.client("dynamodb")


PRODUCTS_TABLE_NAME = os.environ["PRODUCTS_TABLE_NAME"]
ORDERS_TABLE_NAME = os.environ["ORDERS_TABLE_NAME"]


products_table = dynamodb.Table(PRODUCTS_TABLE_NAME)
orders_table = dynamodb.Table(ORDERS_TABLE_NAME)


def decimal_default(value):
    if isinstance(value, Decimal):
        return float(value)

    raise TypeError


def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json"
        },
        "body": json.dumps(
            body,
            default=decimal_default,
            indent=2
        )
    }


def get_user_groups(event):

    claims = (
        event
        .get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
        .get("claims", {})
    )

    groups = claims.get(
        "cognito:groups",
        []
    )

    if isinstance(groups, list):
        return groups

    if isinstance(groups, str):

        groups = groups.strip()

        if groups.startswith("[") and groups.endswith("]"):
            groups = groups[1:-1]

        return [
            group
            .strip()
            .strip('"')
            .strip("'")
            for group in groups.split(",")
            if group.strip()
        ]

    return []


def scan_all_orders():

    orders = []

    result = orders_table.scan()

    orders.extend(
        result.get("Items", [])
    )

    while "LastEvaluatedKey" in result:

        result = orders_table.scan(
            ExclusiveStartKey=
                result["LastEvaluatedKey"]
        )

        orders.extend(
            result.get("Items", [])
        )

    return orders


def lambda_handler(event, context):

    try:

        method = (
            event
            .get("requestContext", {})
            .get("http", {})
            .get("method")
        )

        groups = get_user_groups(event)


        # ====================================================
        # GET /orders
        # ADMIN ONLY
        # ====================================================

        if method == "GET":

            if "ADMIN" not in groups:

                return response(
                    403,
                    {
                        "message":
                            "Admin access required"
                    }
                )

            orders = scan_all_orders()

            orders.sort(
                key=lambda order:
                    order.get(
                        "createdAt",
                        ""
                    ),
                reverse=True
            )

            return response(
                200,
                orders
            )


        # ====================================================
        # POST /orders
        # ADMIN OR EMPLOYEE
        # ====================================================

        if method == "POST":

            if (
                "ADMIN" not in groups
                and
                "EMPLOYEE" not in groups
            ):

                return response(
                    403,
                    {
                        "message":
                            "Employee or Admin access required"
                    }
                )


            body = json.loads(
                event.get("body", "{}")
            )

            product_id = body.get("productId")
            order_quantity = body.get("quantity")


            if (
                not product_id
                or
                order_quantity is None
            ):

                return response(
                    400,
                    {
                        "message":
                            "productId and quantity are required"
                    }
                )


            try:

                order_quantity = Decimal(
                    str(order_quantity)
                )

            except Exception:

                return response(
                    400,
                    {
                        "message":
                            "quantity must be a valid number"
                    }
                )


            if order_quantity <= 0:

                return response(
                    400,
                    {
                        "message":
                            "quantity must be greater than 0"
                    }
                )


            product_result = products_table.get_item(
                Key={
                    "productId": product_id
                }
            )

            product = product_result.get(
                "Item"
            )


            if not product:

                return response(
                    404,
                    {
                        "message":
                            "Product not found"
                    }
                )


            unit_price = product["price"]

            total = (
                unit_price
                * order_quantity
            )


            order_id = (
                "order-"
                + str(uuid.uuid4())
            )


            created_at = (
                datetime.now(
                    timezone.utc
                ).isoformat()
            )


            try:

                dynamodb_client.transact_write_items(

                    TransactItems=[

                        {
                            "Update": {

                                "TableName":
                                    PRODUCTS_TABLE_NAME,

                                "Key": {
                                    "productId": {
                                        "S": product_id
                                    }
                                },

                                "UpdateExpression":
                                    "SET quantity = quantity - :amount",

                                "ConditionExpression":
                                    "attribute_exists(productId) "
                                    "AND quantity >= :amount",

                                "ExpressionAttributeValues": {
                                    ":amount": {
                                        "N": str(order_quantity)
                                    }
                                }
                            }
                        },

                        {
                            "Put": {

                                "TableName":
                                    ORDERS_TABLE_NAME,

                                "Item": {

                                    "orderId": {
                                        "S": order_id
                                    },

                                    "productId": {
                                        "S": product_id
                                    },

                                    "productName": {
                                        "S": product["name"]
                                    },

                                    "quantity": {
                                        "N": str(order_quantity)
                                    },

                                    "unitPrice": {
                                        "N": str(unit_price)
                                    },

                                    "total": {
                                        "N": str(total)
                                    },

                                    "status": {
                                        "S": "CONFIRMED"
                                    },

                                    "createdAt": {
                                        "S": created_at
                                    }
                                },

                                "ConditionExpression":
                                    "attribute_not_exists(orderId)"
                            }
                        }
                    ]
                )


            except ClientError as error:

                error_code = (
                    error.response["Error"]["Code"]
                )

                logger.exception(
                    "Order transaction failed"
                )

                if error_code in [
                    "TransactionCanceledException",
                    "ConditionalCheckFailedException"
                ]:

                    return response(
                        400,
                        {
                            "message":
                                "Insufficient stock or order could not be created"
                        }
                    )

                raise


            order = {

                "orderId":
                    order_id,

                "productId":
                    product_id,

                "productName":
                    product["name"],

                "quantity":
                    order_quantity,

                "unitPrice":
                    unit_price,

                "total":
                    total,

                "status":
                    "CONFIRMED",

                "createdAt":
                    created_at
            }


            return response(
                201,
                {
                    "message":
                        "Order created successfully",

                    "order":
                        order
                }
            )


        return response(
            405,
            {
                "message":
                    "Method not allowed"
            }
        )


    except json.JSONDecodeError:

        return response(
            400,
            {
                "message":
                    "Invalid JSON body"
            }
        )


    except Exception:

        logger.exception(
            "Unexpected Orders Lambda error"
        )

        return response(
            500,
            {
                "message":
                    "Internal server error"
            }
        )