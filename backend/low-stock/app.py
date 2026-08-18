import boto3
import logging
import os
from decimal import Decimal


logger = logging.getLogger()
logger.setLevel(logging.INFO)


sns = boto3.client("sns")

SNS_TOPIC_ARN = os.environ[
    "arn:aws:sns:us-east-1:115484989191:"
    "CloudStock-Low-Stock-Alerts"
]


def get_number(attribute):
    if not attribute:
        return None

    if "N" in attribute:
        return Decimal(attribute["N"])

    return None


def get_string(attribute):
    if not attribute:
        return None

    if "S" in attribute:
        return attribute["S"]

    return None


def lambda_handler(event, context):

    logger.info("Low-stock alert function invoked")

    records = event.get("Records", [])

    logger.info(f"Received {len(records)} DynamoDB stream records")

    alerts_sent = 0

    for record in records:

        event_name = record.get("eventName")

        logger.info(f"Processing stream event: {event_name}")

        # We only care about new or modified products
        if event_name not in ["INSERT", "MODIFY"]:
            logger.info("Skipping unsupported stream event")
            continue

        dynamodb_record = record.get("dynamodb", {})

        new_image = dynamodb_record.get("NewImage", {})
        old_image = dynamodb_record.get("OldImage", {})

        product_id = get_string(
            new_image.get("productId")
        )

        product_name = get_string(
            new_image.get("name")
        )

        new_quantity = get_number(
            new_image.get("quantity")
        )

        low_stock_level = get_number(
            new_image.get("lowStockLevel")
        )

        old_quantity = get_number(
            old_image.get("quantity")
        )

        logger.info(
            f"Product={product_id}, "
            f"new_quantity={new_quantity}, "
            f"old_quantity={old_quantity}, "
            f"threshold={low_stock_level}"
        )

        if (
            new_quantity is None
            or low_stock_level is None
        ):
            logger.warning(
                f"Skipping {product_id}: "
                "quantity or lowStockLevel missing"
            )
            continue

        # For INSERT events, alert if the product starts low.
        # For MODIFY events, alert only when stock crosses
        # from above the threshold to at/below the threshold.
        should_alert = False

        if event_name == "INSERT":

            if new_quantity <= low_stock_level:
                should_alert = True

        elif event_name == "MODIFY":

            if (
                old_quantity is not None
                and old_quantity > low_stock_level
                and new_quantity <= low_stock_level
            ):
                should_alert = True

        if not should_alert:
            logger.info(
                f"No low-stock alert needed for {product_id}"
            )
            continue

        message = (
            "LOW STOCK ALERT\n\n"
            f"Product: {product_name}\n\n"
            f"Product ID: {product_id}\n\n"
            f"Current quantity: {new_quantity}\n\n"
            f"Low stock threshold: {low_stock_level}"
        )

        logger.warning(
            f"Low stock detected for {product_id}. "
            f"Publishing SNS alert."
        )

        sns.publish(
            TopicArn=SNS_TOPIC_ARN,
            Subject="CloudStock Low Stock Alert",
            Message=message
        )

        alerts_sent += 1

        logger.info(
            f"SNS alert sent successfully for {product_id}"
        )

    logger.info(
        f"Stream processing complete. Alerts sent: {alerts_sent}"
    )

    return {
        "statusCode": 200,
        "message": "Stream processed",
        "alertsSent": alerts_sent
    }