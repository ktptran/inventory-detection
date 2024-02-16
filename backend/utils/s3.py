"""Module providing s3 boto3 commands."""


import os
import boto3

region = os.environ['AWS_REGION']
bucket = os.environ['BUCKET_NAME']
s3 = boto3.client('s3')


def s3_upload(s3_key, file_content):
    """Upload a file to an S3 bucket

    :param file_name: File to upload
    :param bucket: Bucket to upload to
    :param object_name: S3 object name. If not specified then file_name is used
    :return: True if file was uploaded, else False
    """
    response = s3.put_object(Body=file_content, Bucket=bucket, Key=s3_key)
    return response


def generate_presigned_url(object, expiration=3600):
    """Generate a presigned URL to share an S3 object
    
    :param object: item to upload
    :param expiration: length in seconds for url
    :return url: presigned url of object
    """
    response = s3.generate_presigned_url('get_object', Params={'Bucket': bucket, 'Key': object},
                                                ExpiresIn=expiration)
    return response
