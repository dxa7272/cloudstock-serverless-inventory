import boto3
import json
import logging
import os

from decimal import Decimal
from botocore.exceptions import ClientError


# ============================================================
# LOGGING
# ============================================================

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# ============================================================
# AWS SERVICES
# ============================================================

dynamodb = boto3.resource("dynamodb")
s3 = boto3.client("s3")


PRODUCTS_TABLE_NAME = os.environ["PRODUCTS_TABLE_NAME"]
IMAGE_BUCKET = os.environ["IMAGE_BUCKET"]


table = dynamodb.Table(PRODUCTS_TABLE_NAME)


# ============================================================
# HELPERS
# ============================================================

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

    authorizer = (
        event.get("requestContext", {})
        .get("authorizer", {})
        .get("jwt", {})
    )

    claims = authorizer.get("claims", {})

    groups = claims.get(
        "cognito:groups",
        []
    )

    if isinstance(groups, list):
        return groups

    if isinstance(groups, str):

        groups = groups.strip()

        if not groups:
            return []

        try:
            parsed = json.loads(groups)

            if isinstance(parsed, list):
                return parsed

        except json.JSONDecodeError:
            pass

        if (
            groups.startswith("[")
            and groups.endswith("]")
        ):
            groups = groups[1:-1]

        parsed_groups = []

        for group in groups.split(","):

            clean_group = (
                group
                .strip()
                .strip('"')
                .strip("'")
                .strip()
            )

            if clean_group:
                parsed_groups.append(
                    clean_group
                )

        return parsed_groups

    return []


def add_image_url(product):

    image_key = product.get(
        "imageKey"
    )

    if not image_key:

        product["imageUrl"] = None

        return product

    try:

        image_url = s3.generate_presigned_url(
            ClientMethod="get_object",
            Params={
                "Bucket": IMAGE_BUCKET,
                "Key": image_key
            },
            ExpiresIn=3600
        )

        product["imageUrl"] = image_url

    except Exception:

        logger.exception(
            "Failed generating image URL for %s",
            image_key
        )

        product["imageUrl"] = None

    return product


# ============================================================
# LAMBDA HANDLER
# ============================================================

def lambda_handler(event, context):

    logger.info(
        "CloudStock Products Lambda invoked"
    )

    method = (
        event.get("requestContext", {})
        .get("http", {})
        .get("method")
    )

    path_parameters = (
        event.get("pathParameters")
        or {}
    )

    product_id = path_parameters.get(
        "productId"
    )

    groups = get_user_groups(event)


    # ========================================================
    # GET /products
    # PUBLIC
    # ========================================================

    if method == "GET" and not product_id:

        result = table.scan()

        products = result.get(
            "Items",
            []
        )

        for product in products:
            add_image_url(product)

        products.sort(
            key=lambda x:
                x["productId"]
        )

        return response(
            200,
            products
        )


    # ========================================================
    # GET /products/{productId}
    # PUBLIC
    # ========================================================

    if method == "GET" and product_id:

        result = table.get_item(
            Key={
                "productId":
                    product_id
            }
        )

        product = result.get(
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

        add_image_url(product)

        return response(
            200,
            product
        )


    # ========================================================
    # POST /products
    # ADMIN ONLY
    # ========================================================

    if method == "POST":

        if "ADMIN" not in groups:

            return response(
                403,
                {
                    "message":
                        "Admin access required"
                }
            )

        body = json.loads(
            event.get(
                "body",
                "{}"
            )
        )

        product = {

            "productId":
                body["productId"],

            "name":
                body["name"],

            "sku":
                body["sku"],

            "category":
                body["category"],

            "price":
                Decimal(
                    str(body["price"])
                ),

            "quantity":
                Decimal(
                    str(body["quantity"])
                ),

            "lowStockLevel":
                Decimal(
                    str(body["lowStockLevel"])
                )
        }

        if body.get("imageKey"):

            product["imageKey"] = (
                body["imageKey"]
            )

        table.put_item(
            Item=product
        )

        add_image_url(product)

        logger.info(
            "Created product %s",
            product["productId"]
        )

        return response(
            201,
            {
                "message":
                    "Product created",

                "product":
                    product
            }
        )


    # ========================================================
    # PUT /products/{productId}
    # ADMIN ONLY
    # ========================================================

    if method == "PUT" and product_id:

        if "ADMIN" not in groups:

            return response(
                403,
                {
                    "message":
                        "Admin access required"
                }
            )

        body = json.loads(
            event.get(
                "body",
                "{}"
            )
        )

        update_expression = (
            "SET #name = :name, "
            "sku = :sku, "
            "category = :category, "
            "price = :price, "
            "quantity = :quantity, "
            "lowStockLevel = :lowStockLevel"
        )

        values = {

            ":name":
                body["name"],

            ":sku":
                body["sku"],

            ":category":
                body["category"],

            ":price":
                Decimal(
                    str(body["price"])
                ),

            ":quantity":
                Decimal(
                    str(body["quantity"])
                ),

            ":lowStockLevel":
                Decimal(
                    str(
                        body[
                            "lowStockLevel"
                        ]
                    )
                )
        }

        if body.get("imageKey"):

            update_expression += (
                ", imageKey = :imageKey"
            )

            values[":imageKey"] = (
                body["imageKey"]
            )

        result = table.update_item(

            Key={
                "productId":
                    product_id
            },

            UpdateExpression=
                update_expression,

            ExpressionAttributeNames={
                "#name": "name"
            },

            ExpressionAttributeValues=
                values,

            ReturnValues="ALL_NEW"
        )

        product = result[
            "Attributes"
        ]

        add_image_url(product)

        return response(
            200,
            {
                "message":
                    "Product updated",

                "product":
                    product
            }
        )


    # ========================================================
    # DELETE /products/{productId}
    # ADMIN ONLY
    # ========================================================

    if (
        method == "DELETE"
        and product_id
    ):

        if "ADMIN" not in groups:

            return response(
                403,
                {
                    "message":
                        "Admin access required"
                }
            )

        table.delete_item(
            Key={
                "productId":
                    product_id
            }
        )

        return response(
            200,
            {
                "message":
                    "Product deleted",

                "productId":
                    product_id
            }
        )


    # ========================================================
    # PATCH /products/{productId}/stock
    # ADMIN ONLY
    # ========================================================

    if (
        method == "PATCH"
        and product_id
    ):

        if "ADMIN" not in groups:

            return response(
                403,
                {
                    "message":
                        "Admin access required"
                }
            )

        body = json.loads(
            event.get(
                "body",
                "{}"
            )
        )

        if "change" not in body:

            return response(
                400,
                {
                    "message":
                        "change is required"
                }
            )

        change = Decimal(
            str(body["change"])
        )

        try:

            if change < 0:

                amount = abs(change)

                result = table.update_item(

                    Key={
                        "productId":
                            product_id
                    },

                    UpdateExpression=(
                        "SET quantity = "
                        "quantity + :change"
                    ),

                    ConditionExpression=(
                        "attribute_exists(productId) "
                        "AND quantity >= :amount"
                    ),

                    ExpressionAttributeValues={
                        ":change": change,
                        ":amount": amount
                    },

                    ReturnValues=
                        "ALL_NEW"
                )

            else:

                result = table.update_item(

                    Key={
                        "productId":
                            product_id
                    },

                    UpdateExpression=(
                        "SET quantity = "
                        "quantity + :change"
                    ),

                    ConditionExpression=(
                        "attribute_exists(productId)"
                    ),

                    ExpressionAttributeValues={
                        ":change":
                            change
                    },

                    ReturnValues=
                        "ALL_NEW"
                )

            product = result[
                "Attributes"
            ]

            add_image_url(product)

            return response(
                200,
                {
                    "message":
                        "Stock updated",

                    "product":
                        product
                }
            )

        except ClientError as error:

            if (
                error.response["Error"]["Code"]
                ==
                "ConditionalCheckFailedException"
            ):

                return response(
                    400,
                    {
                        "message":
                            "Insufficient stock or "
                            "product does not exist"
                    }
                )

            logger.exception(
                "DynamoDB stock update failed"
            )

            raise


    return response(
        405,
        {
            "message":
                "Method not allowed"
        }
    )