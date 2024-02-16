import boto3
import os

PROJECT_VERSION_ARN = os.environ['PROJECT_VERSION_ARN']
BUCKET_NAME = os.environ['BUCKET_NAME']
LABELS = ["orange", "banana", "apple"]
CONFIDENCE_LEVEL = 85

client = boto3.client('rekognition')

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

def detect_custom_label(name):
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
    count = {}
    for label in LABELS:
        count[label] = 0
    for label in example_response['CustomLabels']:
        if label['Confidence'] > CONFIDENCE_LEVEL:
            count[label['Name']] += 1
    return count