#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { AuthStack } from "../lib/auth-stack";

const envVariables = {
	projectName: process.env["PROJECT_NAME"],
	region: process.env["AWS_REGION"],
};

const app = new cdk.App();
new AuthStack(app, "AuthStack", { ...envVariables });
