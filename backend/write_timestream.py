import time
import boto3
import logging
from utils.timestream import write_records

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    
    logger.log("Writing records into timestream database")
    dimensions = [
        {'Name': 'region', 'Value': 'us-west-2'},
        {'Name': 'bucket', 'Value': 'bucket.az'},
        {'Name': 'uuid', 'Value': '550e8400-e29b-41d4-a716-446655440000.jpeg'}
    ]
    common_attributes = {
        'Dimensions': dimensions,
        'MeasureValueType': 'BIGINT',
        'Time': str(int(round(time.time() * 1000)))
    }
    oranges = {
        'MeasureName': 'oranges',
        'MeasureValue': '2'
    }
    apples = {
        'MeasureName': 'apples',
        'MeasureValue': '3'
    }
    bananas = {
        'MeasureName': 'bananas',
        'MeasureValue': '4'        
    }
    records = [oranges, apples, bananas]
    try:
        result = write_records(records, common_attributes)
        logger.log(result)
        return result
    except Exception as err:
        logger.error("Error:", err)
        raise err