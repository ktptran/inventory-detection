"""Module providing timestream boto3 functions."""


import os

import boto3

write_client = boto3.client('timestream-write')
read_client = boto3.client('timestream-query')

DATABASE_NAME = os.environ['DATABASE_NAME']
TABLE_NAME = os.environ['TABLE_NAME']

def write_records(records, common_attributes):
    """Writes record to Timestream table.
    
    :param records: record of information
    :param common_attributes: attributes for every record
    """
    response = write_client.write_records(
        DatabaseName=DATABASE_NAME,
        TableName=TABLE_NAME,
        CommonAttributes=common_attributes,
        Records=records,
    )
    return response

def query_inventory():
    """Queries Amazon timestream for data.
    
    :param query: SQL query
    :return response: boto3 response
    """
    response = read_client.query(
        QueryString=f'SELECT time, key, measure_value::varchar  FROM "{DATABASE_NAME}"."{TABLE_NAME}" ORDER BY time DESC',
    )
    return response