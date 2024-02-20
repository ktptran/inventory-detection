#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Deploy CDK
echo "Tearing down CDK application..."
cd $SCRIPT_DIR/../cdk
cdk destroy --all --force

# Delete rekognition
# TODO: Add in query parameter for checking with name
PROJECT_ARN=$(aws rekognition describe-projects --query 'ProjectDescriptions[*].ProjectArn' --output text)
PROJECT_DATASETS=$(aws rekognition describe-projects --query 'ProjectDescriptions[*].Datasets[*].DatasetArn')
PROJECT_VERSION_ARN=$(aws rekognition describe-project-versions --project-arn "$PROJECT_ARN" --query 'ProjectVersionDescriptions[*].ProjectVersionArn' --output text)
aws rekognition stop-project-version --project-version-arn $PROJECT_VERSION_ARN
# TODO: Wait for proejct to completely stop
aws rekognition delete-project-version --project-version-arn $PROJECT_VERSION_ARN
# Delete associated datasets
aws rekognition delete-dataset --dataset-arn
aws rekognition delete-dataset --dataset-arn
# Delete rekognition project
aws rekognition delete-project --project-arn $PROJECT_ARN

# Return to root project directory
echo "Changing back to root project directory"
cd $SCRIPT_DIR/../
