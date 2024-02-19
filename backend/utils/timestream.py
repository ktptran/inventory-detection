"""Module providing timestream boto3 functions."""


import os

import boto3

write_client = boto3.client('timestream-write')
read_client = boto3.client('timestream-query')

DATABASE_NAME = os.environ['DATABASE_NAME']
TABLE_NAME = os.environ['TABLE_NAME']
POSIT_TABLE_NAME = os.environ['POSIT_TABLE_NAME']

def write_records(records, common_attributes, table):
    """Writes record to Timestream table.
    
    :param records: record of information
    :param common_attributes: attributes for every record
    """
    try:
        response = write_client.write_records(
            DatabaseName=DATABASE_NAME,
            TableName=TABLE_NAME if table == 1 else POSIT_TABLE_NAME,
            CommonAttributes=common_attributes,
            Records=records,
        )
        return response
    except write_client.exceptions.RejectedRecordsException as err:
        _print_rejected_records_exceptions(err)

def query_inventory():
    """Queries Amazon timestream for data.
    
    :param query: SQL query
    :return response: boto3 response
    """
    response = read_client.query(
        QueryString=f'SELECT time, key, measure_name, measure_value::varchar  FROM "{DATABASE_NAME}"."{TABLE_NAME}" ORDER BY time, measure_name DESC',
    )
    return response


def _print_rejected_records_exceptions(err):
    print("RejectedRecords: ", err)
    for rr in err.response["RejectedRecords"]:
        print("Rejected Index " + str(rr["RecordIndex"]) + ": " + rr["Reason"])
        if "ExistingVersion" in rr:
            print("Rejected record existing version: ", rr["ExistingVersion"])