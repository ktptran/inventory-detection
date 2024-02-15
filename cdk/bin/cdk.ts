#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack";
import { ApiStack } from "../lib/api-stack";
import { StorageStack } from "../lib/storage-stack";

const envVariables = {
	environment: process.env["ENV"],
	projectName: process.env["PROJECT_NAME"],
	region: process.env["AWS_REGION"],
	accountId: process.env["AWS_ACCOUNT_ID"],
};

const app = new cdk.App();
new AuthStack(app, "AuthStack", { ...envVariables });

const storageStack = new StorageStack(app, "StorageStack", { ...envVariables });

new ApiStack(app, "ApiStack", {
	...envVariables,
	database: storageStack.database,
	table: storageStack.table,
});

// TODO: WebStack
// Circular dependencies right now for pulling in data and then deploying
// new WebStack(app, "WebStack", { ...envVariables });
