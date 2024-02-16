import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";

export class ProcessingStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { projectName, environment, accountId, region } = props;

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
			}
		);

		const timestreamRole = new cdk.aws_iam.Role(this, "timestreamRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonTimestreamFullAccess"
				),
			],
		});

		const timestreamLambda = new cdk.aws_lambda.Function(
			this,
			"TimestreamLambda",
			{
				code: cdk.aws_lambda.Code.fromAsset("../backend"),
				handler: "write_timestream.handler",
				runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
				role: timestreamRole,
			}
		);

		const imageRekognitionJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			"Custom Rekognition",
			{
				lambdaFunction: imageRekognitionLambda,
				outputPath: "$.rekognition",
			}
		);

		const timestreamJob = new cdk.aws_stepfunctions_tasks.LambdaInvoke(
			this,
			"Timestream Write",
			{
				lambdaFunction: timestreamLambda,
				outputPath: "$.timestream",
			}
		);

		const definition = imageRekognitionJob.next(timestreamJob);

		const smRole = new cdk.aws_iam.Role(this, "smRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
			managedPolicies: [],
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
					"AWSStepFunctionsFullAccess"
				),
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonS3FullAccess"
				),
			],
		});

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

		// TODO: Troubleshoot PutBucketNotificationConfigurationError
		// const s3Bucket = cdk.aws_s3.Bucket.fromBucketName(
		// 	this,
		// 	"s3Bucket",
		// 	`${environment}-${projectName}-${accountId}-${region}-bucket`
		// );
		// s3Bucket.addEventNotification(
		// 	cdk.aws_s3.EventType.OBJECT_CREATED,
		// 	new cdk.aws_s3_notifications.LambdaDestination(triggerStepFunctionLambda),
		// 	{
		// 		prefix: "images/generated/*",
		// 	}
		// );

		// TODO: Custom resource for automatically running lambda

		// CloudFormation outputs
		new cdk.CfnOutput(this, "StateMachineArn", {
			value: sm.stateMachineArn,
			description: "State Machine ARN",
		});
	}
}
