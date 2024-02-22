#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Environment variables
. $SCRIPT_DIR/env.sh

# Delete rekognition
PROJECT_ARN=$(aws rekognition describe-projects \
    --region $AWS_REGION \
    --project-names $PROJECT_NAME \
    --query 'ProjectDescriptions[].ProjectArn' \
    --output text)
PROJECT_DATASETS=$(aws rekognition describe-projects \
    --region $AWS_REGION \
    --project-names $PROJECT_NAME \
    --query 'ProjectDescriptions[*].Datasets[*].DatasetArn[]' \
    --output text)
PROJECT_VERSION_ARN=$(aws rekognition describe-project-versions \
    --region $AWS_REGION \
    --project-arn "$PROJECT_ARN" \
    --query 'ProjectVersionDescriptions[*].ProjectVersionArn' \
    --output text)
aws rekognition stop-project-version \
    --region $AWS_REGION \
    --project-version-arn $PROJECT_VERSION_ARN
sleep 60
aws rekognition delete-project-version \
    --region $AWS_REGION \
    --project-version-arn $PROJECT_VERSION_ARN
sleep 30
aws rekognition delete-dataset \
    --region $AWS_REGION \
    --dataset-arn ${PROJECT_DATASETS:0:85}
aws rekognition delete-dataset \
    --region $AWS_REGION  \
    --dataset-arn ${PROJECT_DATASETS:86:180}
sleep 30
aws rekognition delete-project \
    --region $AWS_REGION  \
    --project-arn $PROJECT_ARN

# Destroy CDK
echo "Tearing down CDK application..."
cd $SCRIPT_DIR/../cdk
cdk destroy --all --force

# Deleting CDK bootstrap
echo "Deleting CDK bootstrap in us-east-1..."
CDK_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name CDKToolkit \
    --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
    --region us-east-1 \
    --output text)
. $SCRIPT_DIR/delete-s3-object-version.sh --bucket $CDK_BUCKET
aws s3 rb s3://$CDK_BUCKET
aws cloudformation delete-stack --stack-name CDKToolkit --region us-east-1

if [ "us-east-1" != "$AWS_REGION" ]; then
    echo "Deleting CDK bootstrap in $AWS_REGION..."
    CDK_BUCKET=$(aws cloudformation describe-stacks \
        --stack-name CDKToolkit \
        --query 'Stacks[0].Outputs[?OutputKey==`BucketName`].OutputValue' \
        --region $AWS_REGION \
        --output text)
    . $SCRIPT_DIR/delete-s3-object-version.sh --bucket $CDK_BUCKET
    aws s3 rb s3://$CDK_BUCKET
    aws cloudformation delete-stack --stack-name CDKToolkit --region $AWS_REGION
fi

# Return to root project directory
echo "Changing back to root project directory"
cd $SCRIPT_DIR/../
