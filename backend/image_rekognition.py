"""Detect image labels."""

import logging

from botocore.exceptions import ClientError
from utils.rekognition import process_custom_label

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    try:
        logger.info('Detecting custom labels')
        logger.info(f"Event: {event}")
        # labels = detect_custom_label(event["s3"]["name"])
        # response = process_custom_label(labels)
        response = process_custom_label({})
        logger.info(f"Custom labels detected: {response}")
        event['labels'] = response
        return event
    except ClientError as e:
        logger.error(e)
        return e

if __name__ == "__main__":
    sample_event = {
        "eventVersion": "2.0",
        "eventSource": "aws:s3",
        "awsRegion": "us-east-1",
        "eventTime": "1970-01-01T00:00:00.000Z",
        "eventName": "ObjectCreated:Put",
        "userIdentity": {
            "principalId": "EXAMPLE"
        },
        "requestParameters": {
            "sourceIPAddress": "127.0.0.1"
        },
        "responseElements": {
            "x-amz-request-id": "EXAMPLE123456789",
            "x-amz-id-2": "EXAMPLE123/5678abcdefghijklambdaisawesome/mnopqrstuvwxyzABCDEFGH"
        },
        "s3": {
            "s3SchemaVersion": "1.0",
            "configurationId": "testConfigRule",
            "bucket": {
            "name": "my-bucket",
            "ownerIdentity": {
                "principalId": "EXAMPLE"
            },
            "arn": "arn:aws:s3:::my-bucket"
            },
            "object": {
            "key": "test%2Fkey",
            "size": 1024,
            "eTag": "0123456789abcdef0123456789abcdef",
            "sequencer": "0A1B2C3D4E5F678901"
            }
        }
    }
    response = handler(sample_event, {})
    print(response)
