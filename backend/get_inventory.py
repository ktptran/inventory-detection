"""Queries Amazon timestream for all of the table data."""


import logging

from botocore.exceptions import ClientError
from utils.processing import api_response
from utils.timestream import query_inventory

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    """Queries Amazon timestream for table data.
    
    :param event: input event
    :param context: lambda context
    """
    try:
        logger.info('Get all inventory entries in timestream table.')
        response = query_inventory()
        logger.info(f"Path: {response}")
        # TODO: Parse through the query
        return api_response(200, response)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)

if __name__ == "__main__":
    event = {}
    print(handler(event, {}))
