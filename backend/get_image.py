import logging
import os
import json
from botocore.exceptions import ClientError
from utils.processing import api_response
from utils.s3 import generate_presigned_url

bucket = os.environ['BUCKET_NAME']
logger = logging.getLogger()
logger.setLevel(logging.INFO)

base_path = "images/generated/"

def handler(event, context):
    try:
        logger.info('Getting image presigned url')
        raw_path = event['rawPath'].split("/")
        key_name = raw_path[-1]
        logger.info(f'Payload: {key_name}')
        path = f"{base_path}{key_name}"
        logger.info(f'Path: {base_path}, file_name: {key_name}')
        response = generate_presigned_url(path, 3600)
        return  api_response(200, response)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)
    
if __name__ == "__main__":
    event = {
        "version": "2.0",
        "routeKey": "$default",
        "rawPath": "/image/2157d1cb-6853-430c-8d8e-85bbb20adbf5.jpeg",
        "rawQueryString": "parameter1=value1&parameter1=value2&parameter2=value",
        "cookies": [
            "cookie1",
            "cookie2"
        ],
        "headers": {
            "header1": "value1",
            "header2": "value1,value2"
        },
        "queryStringParameters": {
            "parameter1": "value1,value2",
            "parameter2": "value"
        },
        "requestContext": {
            "accountId": "123456789012",
            "apiId": "api-id",
            "authentication": {
            "clientCert": {
                "clientCertPem": "CERT_CONTENT",
                "subjectDN": "www.example.com",
                "issuerDN": "Example issuer",
                "serialNumber": "a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1:a1",
                "validity": {
                "notBefore": "May 28 12:30:02 2019 GMT",
                "notAfter": "Aug  5 09:36:04 2021 GMT"
                }
            }
            },
            "authorizer": {
            "jwt": {
                "claims": {
                "claim1": "value1",
                "claim2": "value2"
                },
                "scopes": [
                "scope1",
                "scope2"
                ]
            }
            },
            "domainName": "id.execute-api.us-east-1.amazonaws.com",
            "domainPrefix": "id",
            "http": {
            "method": "POST",
            "path": "/my/path",
            "protocol": "HTTP/1.1",
            "sourceIp": "192.0.2.1",
            "userAgent": "agent"
            },
            "requestId": "id",
            "routeKey": "$default",
            "stage": "$default",
            "time": "12/Mar/2020:19:03:58 +0000",
            "timeEpoch": 1583348638390
        },
        "pathParameters": {
            "parameter1": "value1"
        },
        "isBase64Encoded": False,
        "stageVariables": {
            "stageVariable1": "value1",
            "stageVariable2": "value2"
        }
    }
    print(handler(event, {}))