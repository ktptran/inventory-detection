import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class StorageStack extends cdk.Stack {
	public bucket: cdk.aws_s3.Bucket;
	public database: cdk.aws_timestream.CfnDatabase;
	public table: cdk.aws_timestream.CfnTable;
	public positionTable: cdk.aws_timestream.CfnTable;

	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { environment, projectName, accountId, region } = props;

		const bucketName = `${environment}-${projectName}-${accountId}-${region}-bucket`;

		this.bucket = new cdk.aws_s3.Bucket(this, "Bucket", {
			bucketName,
			publicReadAccess: false,
			autoDeleteObjects: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		this.bucket.addToResourcePolicy(
			new cdk.aws_iam.PolicyStatement({
				resources: [`arn:aws:s3:::${bucketName}`],
				sid: "AWSRekognitionS3AclBucketRead20191011",
				effect: cdk.aws_iam.Effect.ALLOW,
				actions: ["s3:GetBucketAcl", "s3:GetBucketLocation"],
				principals: [
					new cdk.aws_iam.ServicePrincipal("rekognition.amazonaws.com"),
				],
			})
		);
		this.bucket.addToResourcePolicy(
			new cdk.aws_iam.PolicyStatement({
				resources: [`arn:aws:s3:::${bucketName}/*`],
				sid: "AWSRekognitionS3GetBucket20191011",
				actions: [
					"s3:GetObject",
					"s3:GetObjectAcl",
					"s3:GetObjectVersion",
					"s3:GetObjectTagging",
				],
				effect: cdk.aws_iam.Effect.ALLOW,
				principals: [
					new cdk.aws_iam.ServicePrincipal("rekognition.amazonaws.com"),
				],
			})
		);
		this.bucket.addToResourcePolicy(
			new cdk.aws_iam.PolicyStatement({
				resources: [`arn:aws:s3:::${bucketName}`],
				sid: "AWSRekognitionS3ACLBucketWrite20191011",
				actions: ["s3:GetBucketAcl"],
				effect: cdk.aws_iam.Effect.ALLOW,
				principals: [
					new cdk.aws_iam.ServicePrincipal("rekognition.amazonaws.com"),
				],
			})
		);
		this.bucket.addToResourcePolicy(
			new cdk.aws_iam.PolicyStatement({
				resources: [`arn:aws:s3:::${bucketName}/*`],
				sid: "AWSRekognitionS3PutObject20191011",
				actions: ["s3:PutObject"],
				effect: cdk.aws_iam.Effect.ALLOW,
				principals: [
					new cdk.aws_iam.ServicePrincipal("rekognition.amazonaws.com"),
				],
				conditions: {
					StringEquals: {
						"s3:x-amz-acl": "bucket-owner-full-control",
					},
				},
			})
		);

		this.database = new cdk.aws_timestream.CfnDatabase(this, "Database", {
			databaseName: `${environment}-${projectName}-db`,
		});

		this.table = new cdk.aws_timestream.CfnTable(this, "Table", {
			databaseName: `${environment}-${projectName}-db`,
			tableName: `${environment}-${projectName}-table`,
		});

		this.table.addDependency(this.database);

		new cdk.CfnOutput(this, "ImageBucket", {
			value: this.bucket.bucketName,
			description: "Image storage bucket name",
		});

		new cdk.CfnOutput(this, "TimestreamDB", {
			value: this.database.databaseName ?? "",
			description: "Timestream database name",
		});

		new cdk.CfnOutput(this, "TimestreamTable", {
			value: this.table.tableName ?? "",
			description: "Timestream database name",
		});
	}
}
