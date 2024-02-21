#!/bin/bash

# Set input variables
USERNAME=$1
PASSWORD=$2

# Retrieve CloudFormation outputs
COGNITO_USER_POOL=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPool`].OutputValue' --output text)
echo "Cognito User Pool Id: $COGNITO_USER_POOL"

# Create user
echo "Creating user"
aws cognito-idp admin-create-user --user-pool-id $COGNITO_USER_POOL --username $USERNAME --temporary-password $PASSWORD
aws cognito-idp admin-set-user-password --user-pool-id $COGNITO_USER_POOL --username $USERNAME --password $PASSWORD --permanent
echo "Successfully created user: $USERNAME"