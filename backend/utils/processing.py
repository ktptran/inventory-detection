"""Module providing image processing and api response."""
import json


def extract_file_extension(base64_encoded_file):
    """Extracts image extension from base64 encoded file data.
    base64_encoded_file syntax as 'image/png;base64,<<imageData>>.
    
    :param base64_encoded_file: string base64 encoding
    :return extension: string value (default, png)
    """
    extension = 'png'
    if base64_encoded_file.find(';') > -1:
        extension = base64_encoded_file.split(';')[0]
        extension = extension[extension.find('/') + 1:]
    return extension


def api_response(status_code, body):
    """Returns API response.
    
    :param status_code: api status code
    :param body: response body
    :returns api_response: api response
    """
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
        },
        "body": json.dumps(body)
    }
