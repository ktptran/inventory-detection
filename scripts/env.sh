#!/bin/bash

# Setting environment variables
export ENV="dev"
export PROJECT_NAME="inv-det"
export AWS_REGION="us-west-2"
export AWS_ACCOUNT_ID=`aws sts get-caller-identity --query Account --output text`