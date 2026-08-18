import boto3
import json
import logging
import os

from decimal import Decimal


logger = logging.getLogger()
logger.setLevel(logging.INFO)


dynamodb = boto3.resource("dynamodb")


PRODUCTS_TABLE_NAME = os.environ[
    "PRODUCTS_TABLE_NAME"
]

ORDERS_TABLE_NAME = os.environ[
    "ORDERS_TABLE_NAME"
]


products_table = dynamodb.Table(
    PRODUCTS_TABLE_NAME
)

orders_table = dynamodb.Table(
    ORDERS_TABLE_NAME
)


def decimal_default(value):

    if isinstance(value, Decimal):
        return float(value)

    raise TypeError


def response(status_code, body):

    return {
        "statusCode":
            status_code,

        "headers": {
            "Content-Type":
                "application/json"
        },

        "body":
            json.dumps(
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

        if (
            groups.startswith("[")
            and groups.endswith("]")
        ):
            groups = groups[1:-1]

        return [
            group
            .strip()
            .strip('"')
            .strip("'")
            for group
            in groups.split(",")
            if group.strip()
        ]

    return []


def scan_all(table):

    items = []

    result = table.scan()

    items.extend(
        result.get(
            "Items",
            []
        )
    )

    while (
        "LastEvaluatedKey"
        in result
    ):

        result = table.scan(
            ExclusiveStartKey=
                result[
                    "LastEvaluatedKey"
                ]
        )

        items.extend(
            result.get(
                "Items",
                []
            )
        )

    return items


def lambda_handler(event, context):

    try:

        groups = get_user_groups(
            event
        )

        if "ADMIN" not in groups:

            return response(
                403,
                {
                    "message":
                        "Admin access required"
                }
            )

        orders = scan_all(
            orders_table
        )

        products = scan_all(
            products_table
        )


        total_revenue = Decimal(
            "0"
        )

        products_sold = Decimal(
            "0"
        )

        total_orders = 0


        for order in orders:

            if (
                order.get("status")
                ==
                "CONFIRMED"
            ):

                total_orders += 1

                total_revenue += (
                    order.get(
                        "total",
                        Decimal("0")
                    )
                )

                products_sold += (
                    order.get(
                        "quantity",
                        Decimal("0")
                    )
                )


        low_stock_products = 0


        for product in products:

            quantity = (
                product.get(
                    "quantity"
                )
            )

            threshold = (
                product.get(
                    "lowStockLevel"
                )
            )

            if (
                quantity is not None
                and
                threshold is not None
                and
                quantity <= threshold
            ):

                low_stock_products += 1


        return response(
            200,
            {
                "totalRevenue":
                    total_revenue,

                "totalOrders":
                    total_orders,

                "productsSold":
                    products_sold,

                "lowStockProducts":
                    low_stock_products
            }
        )


    except Exception:

        logger.exception(
            "Analytics Lambda failed"
        )

        return response(
            500,
            {
                "message":
                    "Internal server error"
            }
        )