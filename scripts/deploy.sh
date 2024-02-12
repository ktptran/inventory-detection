#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
echo "Script directory: $SCRIPT_DIR"

# Setting environment variables
export project_name="inv-det"
export AWS_REGION="us-west-2"

# Check for CDK Toolkit
echo "Checking for CDK Bootstrap..."
cfn=`aws cloudformation describe-stacks --stack-name CDKToolkit`

if [ -z ${cfn+x} ]; 
    then cdk bootstrap; 
fi

# Deploy CDK
echo "Launching CDK application..."
cd $SCRIPT_DIR/../cdk
cdk synth
cdk deploy --all --require-approval never

# Retrieve frontend configurations for aws-exports
AMPLIFY_EXPORT=$SCRIPT_DIR/../frontend/src/aws-exports.js
cp $SCRIPT_DIR/../frontend/src/aws-exports.js.template $AMPLIFY_EXPORT

# Get CloudFormation outputs
COGNITO_IDENTITY_POOL_ID=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoIdentityPoolId`].OutputValue' --output text)
COGNITO_REGION=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoRegion`].OutputValue' --output text)
COGNITO_USER_POOL=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPool`].OutputValue' --output text)
COGNITO_USER_POOL_WEB_CLIENT=$(aws cloudformation describe-stacks --stack-name AuthStack --query 'Stacks[0].Outputs[?OutputKey==`CognitoUserPoolWebClient`].OutputValue' --output text)

sed -i "s/%COGNITO_IDENTITY_POOL_ID%/$COGNITO_IDENTITY_POOL_ID/g" $AMPLIFY_EXPORT
sed -i "s/%REGION%/$COGNITO_REGION/g" $AMPLIFY_EXPORT
sed -i "s/%COGNITO_USER_POOL_ID%/$COGNITO_USER_POOL/g" $AMPLIFY_EXPORT
sed -i "s/%COGNITO_USER_POOL_WEB_CLIENT_ID%/$COGNITO_USER_POOL_WEB_CLIENT/g" $AMPLIFY_EXPORT





# Return to root project directory
echo "Changing back to root project directory"
cd $SCRIPT_DIR/../
