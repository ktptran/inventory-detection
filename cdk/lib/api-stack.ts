import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as sfn_tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import { HttpUserPoolAuthorizer } from "aws-cdk-lib/aws-apigatewayv2-authorizers";
import { Construct } from "constructs";

export class ApiStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const {
			bucket,
			projectName,
			environment,
			accountId,
			region,
			database,
			table,
			userPool,
		} = props;

		// API Gateway
		const httpApi = new apigw.HttpApi(this, "HttpApi", {
			createDefaultStage: true,
			apiName: `${environment}-${projectName}-api`,
			corsPreflight: {
				allowHeaders: [
					"Content-Type",
					"X-Amz-Date",
					"Authorization",
					"X-Api-Key",
					"Access-Control-Allow-Credentials",
					"Access-Control-Allow-Headers",
				],
				allowMethods: [
					apigw.CorsHttpMethod.GET,
					apigw.CorsHttpMethod.HEAD,
					apigw.CorsHttpMethod.OPTIONS,
					apigw.CorsHttpMethod.POST,
				],
				allowOrigins: ["*"],
			},
		});

		// Puts image in the s3 bucket
		const recordImage = new sfn.CustomState(this, "s3ImageUploader", {
			stateJson: {
				Type: "Task",
				Parameters: {
					Body: {},
					Bucket: `${environment}-${projectName}-${accountId}-${region}-bucket`,
					// TODO: have input parameters for setting the key
					Key: "Example",
				},
				Resource: "arn:aws:states:::aws-sdk:s3:putObject",
			},
		});

		const detectCustomLabels = new sfn.CustomState(this, "detectCustomLabels", {
			stateJson: {
				Type: "Task",
				Parameters: {
					//
					Image: {
						S3Object: {
							Bucket: "string",
							Name: "string",
							Version: "string",
						},
					},
					// TODO: Get projectArn from created
					ProjectVersionArn: "MyData",
				},
				Resource: "arn:aws:states:::aws-sdk:rekognition:detectCustomLabels",
			},
		});

		const writeRecords = new sfn.CustomState(this, "writeRecords", {
			stateJson: {
				Type: "Task",
				Parameters: {
					DatabaseName: `${environment}-${projectName}-db`,
					Records: [{}],
					TableName: `${environment}-${projectName}-table`,
				},
				Resource: "arn:aws:states:::aws-sdk:timestreamwrite:writeRecords",
			},
		});

		const chain = sfn.Chain.start(recordImage)
			.next(detectCustomLabels)
			.next(writeRecords);

		const smRole = new cdk.aws_iam.Role(this, "smRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonS3FullAccess"
				),
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonTimestreamFullAccess"
				),
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonRekognitionFullAccess"
				),
			],
		});

		// TODO: Walk through all of state machine
		const sm = new sfn.StateMachine(this, "StateMachine", {
			definitionBody: sfn.DefinitionBody.fromChainable(chain),
			timeout: cdk.Duration.seconds(30),
			role: smRole,
		});

		// Initializes Step Function with base64 image and runs through the process
		const lambdaImageHandler = new lambda.Function(this, "lambdaImageHandler", {
			code: lambda.Code.fromAsset("../backend/image_uploader"),
			handler: "image_uploader.handler",
			runtime: lambda.Runtime.PYTHON_3_12,
			environment: {
				STATE_MACHINE_ARN: sm.stateMachineArn,
			},
		});

		const imageUploadLambdaProxy =
			new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
				"ImageUploadIntegration",
				lambdaImageHandler
			);

		httpApi.addRoutes({
			path: "/image",
			methods: [apigw.HttpMethod.POST],
			integration: imageUploadLambdaProxy,
		});

		sm.grantStartExecution(lambdaImageHandler);

		// Get list of all information from given timeframe
		const getInventoryRole = new cdk.aws_iam.Role(this, "getInventoryRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonTimestreamFullAccess"
				),
			],
		});

		const getInventoryHandler = new lambda.Function(
			this,
			"getInventoryHandler",
			{
				code: lambda.Code.fromAsset("../backend/image_uploader"),
				handler: "image_uploader.handler",
				runtime: lambda.Runtime.PYTHON_3_12,
				environment: {
					TIMESTREAM_TABLE: table.TableName,
					TIMESTREAM_DATABASE: database.DatabaseName,
				},
				role: getInventoryRole,
			}
		);

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

		// Get image of selected timeframe
		const lambdaImageRole = new cdk.aws_iam.Role(this, "lambdaImageRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonS3FullAccess"
				),
			],
		});

		const getImageHandler = new lambda.Function(this, "getImageHandler", {
			code: lambda.Code.fromAsset("../backend/image_uploader"),
			handler: "image_uploader.handler",
			runtime: lambda.Runtime.PYTHON_3_12,
			environment: {
				S3_BUCKET: bucket.bucketName,
			},
			role: lambdaImageRole,
		});

		const getImageProxy =
			new cdk.aws_apigatewayv2_integrations.HttpLambdaIntegration(
				"getImageIntegration",
				getImageHandler
			);

		httpApi.addRoutes({
			path: "/image",
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
