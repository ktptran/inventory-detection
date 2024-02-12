#!/bin/bash

COGNITO_USER_POOL=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPool`].OutputValue' --output text)
echo "Cognito User Pool Id: $COGNITO_USER_POOL"

echo "Creating user"
aws cognito-idp admin-create-user --user-pool-id $COGNITO_USER_POOL --username test --temporary-password TestPassword123$
aws cognito-idp admin-set-user-password --user-pool-id $COGNITO_USER_POOL --username test --password TestPassword123$ --permanent
echo "Successfully created user: test"