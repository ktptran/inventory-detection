import json
import logging
import base64
import uuid
import os
from utils.processing import extract_file_extension, api_response
from utils.s3 import s3_upload, generate_presigned_url
from botocore.exceptions import ClientError

bucket = os.environ['BUCKET_NAME']

base_path = "/images/generated/"

logger = logging.getLogger()
logger.setLevel(logging.INFO)


# main lambda handler method
def handler(event, context):
    try:
        logger.info('Uploading image to s3')
        payload = json.loads(event['body'])
        logger.info(f'Payload: {payload}')
        image = payload['content']
        if 'fileName' in payload:
            file_name = payload['fileName']
        else:
            file_extension = extract_file_extension(image)
            file_name = f"{str(uuid.uuid1())}.{file_extension}"
        path = f'{base_path}/{file_name}'
        image = image[image.find(",") + 1:]
        file_content = base64.b64decode(image)
        logger.info(f'saving_s3_file , bucket={bucket} , path={path}')
        s3_upload(file_name, file_content, path)
        logger.info('S3 Result' + json.dumps(response, indent=2))
        response = {
            'success': True,
            's3_url': generate_presigned_url(path, file_name)
        }
        return api_response(200, json.dumps(response))
    except ClientError as e:
        logger.error(e)
        return api_response(500, e)