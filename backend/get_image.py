import logging
import os
import json
from botocore.exceptions import ClientError
from utils.processing import api_response
from utils.s3 import generate_presigned_url

bucket = os.environ['BUCKET_NAME']
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    try:
        logger.info('Getting imasge presigned url')
        payload = json.loads(event['body'])
        logger.info(f'Payload: {payload}')
        path, file_name = payload['content'], payload['file_name']
        logger.info(f'Path: {path}, file_name: {file_name}')
        response = generate_presigned_url(path, file_name)
        return  api_response(200, response)
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)