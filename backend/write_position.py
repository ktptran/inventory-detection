"""Writing inventory data into timestream table using step function"""

import logging
import time

from utils.timestream import write_records

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def handler(event, context):
    """Writes position data
    
    :param event: input event from step function
    :context context: event context
    """    
    logger.info("Writing position records into timestream database.")
    dimensions = [
        {'Name': 'account_name', 'Value': "HelloWorld" }
    ]
    common_attributes = {
        'Dimensions': dimensions,
        'MeasureValueType': 'VARCHAR',
        'Time': str(int(round(time.time() * 1000)))        
    }
    records = []
    for label in event['locations'].keys():
        # TODO: Put width and height
        records.append({
            "MeasureName": "",
            "MeasureValue": "",
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
    sample_event = {}
    response = handler(sample_event, {})
    print(response)