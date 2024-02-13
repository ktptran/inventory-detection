import * as cdk from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { Construct } from "constructs";

export class BucketStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const storageBucket = new cdk.aws_s3.Bucket(this, "Bucket", {});

		new cdk.CfnOutput(this, "ImageBucket", {
			value: storageBucket.bucketName,
			description: "Image storage bucket name",
		});
	}
}
