"""Writing inventory data into timestream table using step function"""


import logging
import time

from utils.timestream import write_records

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def handler(event, context):
    """Writes inventory data
    
    :param event: input event from step function
    :context context: event context
    """
    logger.info("Writing inventory records into timestream database")
    dimensions = [
        {'Name': 'region', 'Value': event["awsRegion"]},
        {'Name': 'bucket', 'Value': event["s3"]["bucket"]["name"]},
        {'Name': 'key', 'Value': event["s3"]["object"]["key"]}
    ]
    common_attributes = {
        'Dimensions': dimensions,
        'MeasureValueType': 'VARCHAR',
        'Time': str(int(round(time.time() * 1000)))
    }
    records = []
    for label in event["taskresult"]["Payload"].keys():
        records.append({
            "MeasureName": label,
            "MeasureValue": str(event["taskresult"]["Payload"][label])
        })
    try:
        result = write_records(records, common_attributes)
        logger.info(f"Ingested: records {records}, common_attributes: {common_attributes}")
        logger.info(result)
        return result
    except Exception as err:
        logger.error(f"Error: {err}")
        raise err
    

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
        },
        "taskresult": {
            "ExecutedVersion": "$LATEST",
            "Payload": {
                "orange": 0,
                "banana": 2,
                "apple": 1
            },
            "SdkHttpMetadata": {
            "AllHttpHeaders": {
                "X-Amz-Executed-Version": [
                    "$LATEST"
                ],
                "x-amzn-Remapped-Content-Length": [
                    "0"
                ],
                "Connection": [
                    "keep-alive"
                ],
                "x-amzn-RequestId": [
                    "8a93772d-42db-4a24-974b-a682876ae24e"
                ],
                "Content-Length": [
                    "38"
                ],
                "Date": [
                    "Fri, 16 Feb 2024 22:32:29 GMT"
                ],
                "X-Amzn-Trace-Id": [
                    "root=1-65cfe27d-2eac6cab18474d67155651b4;parent=037840104f8071ba;sampled=0;lineage=6d429cd8:0"
                ],
                "Content-Type": [
                    "application/json"
                ]
            },
            "HttpHeaders": {
                "Connection": "keep-alive",
                "Content-Length": "38",
                "Content-Type": "application/json",
                "Date": "Fri, 16 Feb 2024 22:32:29 GMT",
                "X-Amz-Executed-Version": "$LATEST",
                "x-amzn-Remapped-Content-Length": "0",
                "x-amzn-RequestId": "8a93772d-42db-4a24-974b-a682876ae24e",
                "X-Amzn-Trace-Id": "root=1-65cfe27d-2eac6cab18474d67155651b4;parent=037840104f8071ba;sampled=0;lineage=6d429cd8:0"
            },
            "HttpStatusCode": 200
            },
            "SdkResponseMetadata": {
            "RequestId": "8a93772d-42db-4a24-974b-a682876ae24e"
            },
            "StatusCode": 200
        }
    }
    response = handler(sample_event, {})
    print(response)
