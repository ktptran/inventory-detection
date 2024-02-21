import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";

export class ApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const {
			projectName,
			environment,
			accountId,
			region,
			database,
			table,
			userPool,
		} = props;

		const bucketName = `${environment}-${projectName}-${accountId}-${region}-bucket`;
		const databaseName = `${environment}-${projectName}-db`;
		const tableName = `${environment}-${projectName}-table`;
		const positTableName = `${environment}-${projectName}-positTable`;

		// API Gateway
		const authorizer = new HttpUserPoolAuthorizer("UserAuthorizer", userPool);

		const httpApi = new apigw.HttpApi(this, "HttpApi", {
			createDefaultStage: true,
			apiName: `${environment}-${projectName}-api`,
			corsPreflight: {
				allowHeaders: [
					"Authorization",
					"Access-Control-Allow-Credentials",
					"Access-Control-Allow-Headers",
					"Access-Control-Allow-Methods",
					"Access-Control-Allow-Origin",
					"Content-Type",
				],
				allowMethods: [
					apigw.CorsHttpMethod.GET,
					apigw.CorsHttpMethod.HEAD,
					apigw.CorsHttpMethod.OPTIONS,
					apigw.CorsHttpMethod.POST,
					apigw.CorsHttpMethod.PUT,
				],
				allowOrigins: ["*"],
			},
			// defaultAuthorizer: authorizer,
		});

		/**
		 * Roles
		 */
		const lambdaS3Role = new cdk.aws_iam.Role(this, "lambdaS3Role", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"service-role/AWSLambdaBasicExecutionRole"
				),
			],
		});

		lambdaS3Role.addToPolicy(
			new cdk.aws_iam.PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				resources: [`arn:aws:s3:::${bucketName}/*`],
				actions: [
					"s3:PutObject",
					"s3:PutObjectAcl",
					"s3:GetObject",
					"s3:GetObjectAcl",
				],
			})
		);

		// Retrieving latest entry and associated image
		const getInventoryRole = new cdk.aws_iam.Role(this, "getInventoryRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"service-role/AWSLambdaBasicExecutionRole"
				),
			],
		});
		getInventoryRole.addToPolicy(
			new cdk.aws_iam.PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				resources: [
					`arn:aws:timestream:${region}:${this.account}:database/${databaseName}/table/${tableName}`,
				],
				actions: [
					"timestream:Select",
					"timestream:DescribeTable",
					"timestream:ListMeasures",
				],
			})
		);

		const timestreamDescribeEndpointsPolicy = new cdk.aws_iam.PolicyStatement({
			effect: cdk.aws_iam.Effect.ALLOW,
			resources: ["*"],
			actions: [
				"timestream:DescribeEndpoints",
				"timestream:SelectValues",
				"timestream:CancelQuery",
			],
		});
		getInventoryRole.addToPolicy(timestreamDescribeEndpointsPolicy);

		/**
		 * Lambda functions
		 */

		// Initializes Step Function with base64 image and runs through the process
		const lambdaImageHandler = new lambda.Function(this, "lambdaImageHandler", {
			code: lambda.Code.fromAsset("../backend"),
			handler: "image_uploader.handler",
			runtime: lambda.Runtime.PYTHON_3_12,
			environment: {
				BUCKET_NAME: `${environment}-${projectName}-${accountId}-${region}-bucket`,
			},
			role: lambdaS3Role,
		});

		// Get list of all information from given timeframe
		const getInventoryHandler = new lambda.Function(
			this,
			"getInventoryHandler",
			{
				code: lambda.Code.fromAsset("../backend"),
				handler: "get_inventory.handler",
				runtime: lambda.Runtime.PYTHON_3_12,
				environment: {
					TABLE_NAME: tableName,
					DATABASE_NAME: databaseName,
					BUCKET_NAME: bucketName,
				},
				role: getInventoryRole,
			}
		);

		// Get image of selected timeframe
		const getImageHandler = new lambda.Function(this, "getImageHandler", {
			code: lambda.Code.fromAsset("../backend"),
			handler: "get_image.handler",
			runtime: lambda.Runtime.PYTHON_3_12,
			environment: {
				BUCKET_NAME: bucketName,
			},
			role: lambdaS3Role,
		});

		/**
		 * Lambda & API Gateway integrations
		 */
		const imageUploadLambdaProxy =
			new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
				"ImageUploadIntegration",
				lambdaImageHandler
			);

		httpApi.addRoutes({
			path: "/image",
			methods: [apigw.HttpMethod.PUT],
			integration: imageUploadLambdaProxy,
		});

		const getInventoryProxy =
			new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
				"getInventoryIntegration",
				getInventoryHandler
			);

		httpApi.addRoutes({
			path: "/inventory",
			methods: [apigw.HttpMethod.GET],
			integration: getInventoryProxy,
		});

		const getImageProxy =
			new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
				"getImageIntegration",
				getImageHandler
			);

		httpApi.addRoutes({
			path: "/image/{key_name}",
			methods: [apigw.HttpMethod.GET],
			integration: getImageProxy,
		});

		// Cloudformation Outputs
		new cdk.CfnOutput(this, "ApiId", {
			exportName: "ApiId",
			value: httpApi.apiId,
			description: "The id of the API Gateway",
		});

		new cdk.CfnOutput(this, "ApiEndpoint", {
			exportName: "ApiEndpoint",
			value: httpApi.apiEndpoint,
			description: "The endpoint URL of the API Gateway",
		});
	}
}
