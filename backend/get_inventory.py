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
        data = []
        rows = response['Rows']
        for entry_index in range(int(len(rows) / 3)):
            start_index = entry_index * 3
            entry = {
                "time": rows[start_index]['Data'][0]['ScalarValue'],
                "key": rows[start_index]['Data'][1]['ScalarValue'].split("/")[2],
                "orange": rows[start_index]['Data'][3]['ScalarValue'],
                "banana": rows[start_index + 1]['Data'][3]['ScalarValue'],
                "apple": rows[start_index + 2]['Data'][3]['ScalarValue']
            }
            data.append(entry)
        logger.info(f"Data: {data}")
        # TODO: Parse through the query
        return api_response(200, data)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)

if __name__ == "__main__":
    event = {}
    print(handler(event, {}))
