import logging
from botocore.exceptions import ClientError
from utils.rekognition import process_custom_label

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    try:
        logger.info('Detecting custom labels')
        logger.info(f"Event: {event}")
        response = process_custom_label()
        logger.info(f"Custom labels detected: {response}")
        return response
    except ClientError as e:
        logger.error(e)
        return e
