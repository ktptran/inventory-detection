import * as cdk from "aws-cdk-lib";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import { Construct } from "constructs";

export interface ProcessingStackProps extends cdk.StackProps {
	projectName: string;
	environment: string;
	accountId: string;
	region: string;
	database: cdk.aws_timestream.CfnDatabase;
	table: cdk.aws_timestream.CfnTable;
	bucket: cdk.aws_s3.Bucket;
}

export class ProcessingStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props: ProcessingStackProps) {
		super(scope, id, props);

		const {
			projectName,
			environment,
			accountId,
			region,
			database,
			table,
			bucket,
		} = props;

		const imageRekognitionRole = new cdk.aws_iam.Role(
			this,
			"imageRekognitionRole",
			{
				assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
				managedPolicies: [
					cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
						"AmazonRekognitionCustomLabelsFullAccess"
					),
					cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
						"service-role/AWSLambdaBasicExecutionRole"
					),
					cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
						"AmazonS3ReadOnlyAccess"
					),
				],
			}
		);

		const imageRekognitionLambda = new cdk.aws_lambda.Function(
			this,
			"TriggerLambda",
			{
				code: cdk.aws_lambda.Code.fromAsset("../backend"),
				handler: "image_rekognition.handler",
				runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
				role: imageRekognitionRole,
				// Environment is updated in rekognition-data script.
			}
		);

		const timestreamRole = new cdk.aws_iam.Role(this, "timestreamRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
		});

		timestreamRole.addToPolicy(
			new PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				resources: [
					`arn:aws:timestream:${region}:${this.account}:database/${database.databaseName}/table/${table.tableName}`,
				],
				actions: ["timestream:WriteRecords"],
			})
		);

		timestreamRole.addToPolicy(
			new PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				resources: ["*"],
				actions: ["timestream:DescribeEndpoints"],
			})
		);

		const timestreamLambda = new cdk.aws_lambda.Function(
			this,
			"TimestreamLambda",
			{
				code: cdk.aws_lambda.Code.fromAsset("../backend"),
				handler: "write_inventory.handler",
				runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
				role: timestreamRole,
				environment: {
					DATABASE_NAME: database.databaseName ?? "",
					TABLE_NAME: table.tableName ?? "",
				},
			}
		);

		const imageRekognitionJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			"Custom Rekognition",
			{
				lambdaFunction: imageRekognitionLambda,
				resultPath: "$.taskresult",
			}
		);

		const timestreamJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			"Timestream Write",
			{
				lambdaFunction: timestreamLambda,
				resultPath: "$.taskresult",
			}
		);

		const definition = imageRekognitionJob.next(timestreamJob);

		const smRole = new cdk.aws_iam.Role(this, "smRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
		});

		const sm = new sfn.StateMachine(this, "StateMachine", {
			definitionBody: sfn.DefinitionBody.fromChainable(definition),
			timeout: cdk.Duration.seconds(30),
			role: smRole,
		});

		// Trigger lambda
		const triggerLambdaRole = new cdk.aws_iam.Role(this, "getInventoryRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"service-role/AWSLambdaBasicExecutionRole"
				),
			],
		});

		triggerLambdaRole.addToPolicy(
			new PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				resources: [sm.stateMachineArn],
				actions: ["states:StartExecution"],
			})
		);

		const triggerStepFunctionLambda = new cdk.aws_lambda.Function(
			this,
			"TriggerStepFunctionLambda",
			{
				code: cdk.aws_lambda.Code.fromAsset("../backend"),
				handler: "trigger_sfn.handler",
				runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
				environment: {
					SFN_ARN: sm.stateMachineArn,
				},
				role: triggerLambdaRole,
			}
		);

		// S3 bucket Lambda trigger
		const s3Bucket = cdk.aws_s3.Bucket.fromBucketName(
			this,
			"s3Bucket",
			bucket.bucketName ?? ""
		);
		s3Bucket.addEventNotification(
			cdk.aws_s3.EventType.OBJECT_CREATED,
			new cdk.aws_s3_notifications.LambdaDestination(triggerStepFunctionLambda),
			{
				prefix: "images/generated/",
			}
		);

		// CloudFormation outputs
		new cdk.CfnOutput(this, "StateMachineArn", {
			value: sm.stateMachineArn,
			description: "State Machine ARN",
		});

		new cdk.CfnOutput(this, "ImageRekognitionLambdaARN", {
			value: imageRekognitionLambda.functionArn,
			description: "Image rekognition Lambda Function ARN",
		});
	}
}
