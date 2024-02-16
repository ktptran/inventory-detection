"""Trigger Step Function state machine after S3 put."""

import json
import logging
import os
import time

import boto3
from botocore.exceptions import ClientError
from utils.processing import api_response

logger = logging.getLogger()
logger.setLevel(logging.INFO)

sfn_arn = os.environ['SFN_ARN']

sfn_client = boto3.client('stepfunctions')

def handler(event, context):
    """Main handler"""
    try:
        trigger_event = event['Records'][0]
        trigger_event['time'] = str(int(time.time() * 1000))
        logger.info(f"Starting step function with following event: {trigger_event}")
        response = sfn_client.start_execution(
            stateMachineArn=sfn_arn,
            input=json.dumps(trigger_event),
        )
        return api_response(200, response)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)
    