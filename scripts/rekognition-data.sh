#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"

PROJECT_NAME='inv-det'

BUCKET_NAME=$(aws cloudformation describe-stacks --stack-name StorageStack --query 'Stacks[0].Outputs[?OutputKey==`ImageBucket`].OutputValue' --output text)
echo "Bucket name: $BUCKET_NAME"

echo "Generating manifest file..."
TRAIN_MANIFEST_EXPORT=$SCRIPT_DIR/../model-data/train/output.manifest
cp $SCRIPT_DIR/../model-data/train/output.manifest.template $MANIFEST_EXPORT
sed -i -e "s/%BUCKET_NAME%/$BUCKET_NAME/g" $MANIFEST_EXPORT

echo "Uploading files to S3..."
aws s3 cp $SCRIPT_DIR/../model-data/ s3://$BUCKET_NAME/images/training/ --recursive

echo "Creating Amazon Rekognition project and dataset..."
PROJECT_ARN=$(aws rekognition create-project --project-name $PROJECT_NAME --query ProjectArn)
DATASET_ARN=$(aws rekognition create-dataset \
    --project-arn $PROJECT_ARN \
    --dataset-type TEST \
    --dataset-source "{ \"GroundTruthManifest\": { \"S3Object\": { \"Bucket\": \"$BUCKET_NAME\", \"Name\": \"images/training/output.manifest\" } } }" \
    --query DatasetArn)
echo "Creating project version..."
PROJECT_VERSION_ARN=$(aws rekognition create-project-version \
    --version-name $PROJECT_NAME-v1 \
    --project-arn $PROJECT_ARN \
    --output-config "{ \"S3Bucket\": \"$BUCKET_NAME\", \"S3KeyPrefix\": \"images/training/output/\"  }" \
    --query ProjectVersionArn)

echo "Starting project version..."

aws rekognition start-project-version --project-version-arn $PROJECT_VERSION_ARN
aws rekognition wait project-version-running-completed --project-arn $PROJECT_ARN
echo "Project version: $PROJECT_VERSION_ARN completed"
