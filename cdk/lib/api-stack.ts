import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { bucket, projectName, region, database, table } = props;

		// API Gateway
		const httpApi = new apigw.HttpApi(this, "HttpApi", {
			createDefaultStage: true, // Creates API URL
		});
	}
}
