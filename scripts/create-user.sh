#!/bin/bash

# Set input variables
export USER=$1
export PASSWORD=$2

# Retrieve CloudFormation outputs
COGNITO_USER_POOL=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPool`].OutputValue' --output text)
echo "Cognito User Pool Id: $COGNITO_USER_POOL"

# Create user
echo "Creating user"
aws cognito-idp admin-create-user --user-pool-id $COGNITO_USER_POOL --username $USER --temporary-password $PASSWORD --output text
aws cognito-idp admin-set-user-password --user-pool-id $COGNITO_USER_POOL --username $USER --password $PASSWORD --permanent
echo "Successfully created user: $USER"