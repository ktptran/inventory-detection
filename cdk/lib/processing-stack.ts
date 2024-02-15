import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";

export class ProcessingStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { projectName, environment, accountId, region } = props;

		// Puts image in the s3 bucket
		// TODO: Lambda function for intiailizing when put in specific folder
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

		// TODO: Walk through all of state machine
		const sm = new sfn.StateMachine(this, "StateMachine", {
			definitionBody: sfn.DefinitionBody.fromChainable(chain),
			timeout: cdk.Duration.seconds(30),
			role: smRole,
		});
	}
}
