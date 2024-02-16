"""Module providing timestream boto3 functions."""


import boto3
import os

write_client = boto3.client('timestream-write')
read_client = boto3.client('timestream-query')

DATABASE_NAME = os.environ['DATABASE_NAME']
TABLE_NAME = os.environ['TABLE_NAME']

def write_records(records, common_attributes):
    response = write_client.write_records(
        DatabaseName=DATABASE_NAME,
        TableName=TABLE_NAME,
        CommonAttributes=common_attributes,
        Records=records,
    )
    return response
