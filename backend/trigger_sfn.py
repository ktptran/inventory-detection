import boto3
import logging
import os
import json
from botocore.exceptions import ClientError
from utils.processing import api_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sfn_arn = os.environ['SFN_ARN']

sfn_client = boto3.client('stepfunctions')

def handler(event, context):
    try:
        logger.info(f"Starting step function with following event: {event}")
        response = sfn_client.start_execution(
            stateMachineArn=sfn_arn,
            input=json.dumps(event),
        )
        return api_response(200, response)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)