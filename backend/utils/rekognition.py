"""Utils providing rekognition boto3 commands."""


import os

import boto3

PROJECT_VERSION_ARN = os.environ['PROJECT_VERSION_ARN']
BUCKET_NAME = os.environ['BUCKET_NAME']
LABELS = ["orange", "banana", "apple"]
CONFIDENCE_LEVEL = 85

client = boto3.client('rekognition')


def detect_custom_label(name):
    """Detects custom label using Amazon Rekognition

    :param name: S3 object key name
    :return response: rekognition client response
    """
    response = client.detect_custom_labels(
        ProjectVersionArn=PROJECT_VERSION_ARN,
        Image={
            'S3Object': {
                'Bucket': BUCKET_NAME,
                'Name': name,
            }
        }
    )
    return response

def process_custom_label(response):
    """Processes custom label.
    
    :param response: response from rekognition client
    :return count: object with counts of fruits
    """
    count = {}
    for label in LABELS:
        count[label] = 0
    for label in response['CustomLabels']:
        if label['Confidence'] > CONFIDENCE_LEVEL:
            count[label['Name']] += 1
    return count


if __name__ == "__main__":
    example_response = {
        'CustomLabels': [
            {
                'Name': 'banana',
                'Confidence': 90,
                'Geometry': {
                    'BoundingBox': {
                        'Width': 0,
                        'Height': 0,
                        'Left': 10,
                        'Top': 10
                    },
                    'Polygon': [
                        {
                            'X': 10,
                            'Y': 15
                        },
                    ]
                }
            },
            {
                'Name': 'apple',
                'Confidence': 90,
                'Geometry': {
                    'BoundingBox': {
                        'Width': 0,
                        'Height': 0,
                        'Left': 10,
                        'Top': 10
                    },
                    'Polygon': [
                        {
                            'X': 10,
                            'Y': 15
                        },
                    ]
                }
            },
            {
                'Name': 'banana',
                'Confidence': 90,
                'Geometry': {
                    'BoundingBox': {
                        'Width': 0,
                        'Height': 0,
                        'Left': 10,
                        'Top': 10
                    },
                    'Polygon': [
                        {
                            'X': 10,
                            'Y': 15
                        },
                    ]
                }
            },
        ]
    }
    process_custom_label(example_response)