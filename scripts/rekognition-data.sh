#!/bin/bash

# Environment variables
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"
bash $SCRIPT_DIR/env.sh

# Pulling S3 bucket name
BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name StorageStack --query 'Stacks[0].Outputs[?OutputKey==`ImageBucket`].OutputValue' --output text)
echo "Bucket name: $BUCKET_NAME"

# Generating manifest files to update based on S3 bucket
echo "Generating manifest files..."
TRAIN_FOLDER=$SCRIPT_DIR/../model-data
cp $TRAIN_FOLDER/train/output.manifest.template $TRAIN_FOLDER/train/output.manifest
sed -i -e "s/%BUCKET_NAME%/$BUCKET_NAME/g" $TRAIN_FOLDER/train/output.manifest
cp $TRAIN_FOLDER/test/output.manifest.template $TRAIN_FOLDER/test/output.manifest
sed -i -e "s/%BUCKET_NAME%/$BUCKET_NAME/g" $TRAIN_FOLDER/test/output.manifest

# Uploading folder to S3
echo "Uploading files to S3..."
aws s3 cp $SCRIPT_DIR/../model-data s3://$BUCKET_NAME/images/training --recursive

# Amazon Rekognition creating project and associated datasets
echo "Creating Amazon Rekognition project and dataset..."
PROJECT_ARN=$(aws rekognition create-project --project-name $PROJECT_NAME --query ProjectArn --output text)
DATASET_TEST_ARN=$(aws rekognition create-dataset --project-arn "$PROJECT_ARN" \
    --dataset-type TEST \
    --dataset-source "{ \"GroundTruthManifest\": { \"S3Object\": { \"Bucket\": \"$BUCKET_NAME\", \"Name\": \"images/training/test/output.manifest\" } } }" \
    --query DatasetArn \
    --output text)
DATASET_TRAIN_ARN=$(aws rekognition create-dataset \
    --project-arn $PROJECT_ARN \
    --dataset-type TRAIN \
    --dataset-source "{ \"GroundTruthManifest\": { \"S3Object\": { \"Bucket\": \"$BUCKET_NAME\", \"Name\": \"images/training/train/output.manifest\" } } }" \
    --query DatasetArn \
    --output text)

# Create new project version
echo "Creating project version..."
PROJECT_VERSION_ARN=$(aws rekognition create-project-version \
    --version-name $PROJECT_NAME-v1 \
    --project-arn $PROJECT_ARN \
    --output-config "{ \"S3Bucket\": \"$BUCKET_NAME\", \"S3KeyPrefix\": \"images/training/output/\"  }" \
    --query ProjectVersionArn \
    --output text)
aws rekognition wait project-version-training-completed --project-arn $PROJECT_ARN
echo "Project version training completed: $PROJECT_ARN"

# Starting Amazon rekognition project version
echo "Starting project version..."
aws rekognition start-project-version --project-version-arn $PROJECT_VERSION_ARN
aws rekognition wait project-version-running-completed --project-arn $PROJECT_ARN
echo "Project version: $PROJECT_VERSION_ARN completed"

# Update Lambda with project ARN
echo "Updating rekognition lambda with custom model..."
LAMBDA_ARN=$(aws cloudformation describe-stacks --stack-name ProcessingStack --query 'Stacks[0].Outputs[?OutputKey==`ImageRekognitionLambdaARN`].OutputValue' --output text)
UPDATE_COMPLETE=$(aws lambda update-function-configuration \
    --function-name $LAMBDA_ARN \
    --environment "{\"Variables\": {\"PROJECT_VERSION_ARN\": \"$PROJECT_VERSION_ARN\", \"BUCKET_NAME\": \"$BUCKET_NAME\"}}"  \
    --output text)
echo "Successfully updated Lambda function."

