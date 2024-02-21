#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import "source-map-support/register";
import { ApiStack } from "../lib/api-stack";
import { AuthStack } from "../lib/auth-stack";
import { ProcessingStack } from "../lib/processing-stack";
import { StorageStack } from "../lib/storage-stack";
import { WebStack } from "../lib/web-stack";

const envVariables = {
	environment: process.env["ENV"],
	projectName: process.env["PROJECT_NAME"],
	region: process.env["AWS_REGION"],
	accountId: process.env["AWS_ACCOUNT_ID"],
};

const app = new cdk.App();
const authStack = new AuthStack(app, "AuthStack", { ...envVariables });

const storageStack = new StorageStack(app, "StorageStack", { ...envVariables });

new ApiStack(app, "ApiStack", {
	...envVariables,
	database: storageStack.database,
	table: storageStack.table,
	userPool: authStack.userPool,
});

new ProcessingStack(app, "ProcessingStack", {
	database: storageStack.database,
	table: storageStack.table,
	...envVariables,
});

new WebStack(app, "WebStack", { ...envVariables });
