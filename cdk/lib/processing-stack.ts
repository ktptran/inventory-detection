import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";

export class ProcessingStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { projectName, environment, accountId, region } = props;

		const detectCustomLabels = new sfn.CustomState(this, "detectCustomLabels", {
			stateJson: {
				Type: "Task",
				Parameters: {
					Image: {
						S3Object: {
							Bucket: "string",
							Name: "string",
							Version: "string",
						},
					},
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

		const chain = sfn.Chain.start(detectCustomLabels).next(writeRecords);

		const smRole = new cdk.aws_iam.Role(this, "smRole", {
			assumedBy: new cdk.aws_iam.ServicePrincipal("states.amazonaws.com"),
			managedPolicies: [
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonTimestreamFullAccess"
				),
				cdk.aws_iam.ManagedPolicy.fromAwsManagedPolicyName(
					"AmazonRekognitionFullAccess"
				),
			],
		});

		const sm = new sfn.StateMachine(this, "StateMachine", {
			definitionBody: sfn.DefinitionBody.fromChainable(chain),
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

		new cdk.aws_lambda.Function(this, "TriggerLambda", {
			code: cdk.aws_lambda.Code.fromAsset("../backend"),
			handler: "trigger_sfn.handler",
			runtime: cdk.aws_lambda.Runtime.PYTHON_3_12,
			environment: {
				SFN_ARN: sm.stateMachineArn,
			},
			role: triggerLambdaRole,
		});

		// TODO: Custom resource for automatically running lambda

		// CloudFormation outputs
		new cdk.CfnOutput(this, "StateMachineArn", {
			value: sm.stateMachineArn,
			description: "State Machine ARN",
		});
	}
}
