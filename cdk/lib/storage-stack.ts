import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class StorageStack extends cdk.Stack {
	public bucket: cdk.aws_s3.Bucket;
	public database: cdk.aws_timestream.CfnDatabase;
	public table: cdk.aws_timestream.CfnTable;

	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		this.bucket = new cdk.aws_s3.Bucket(this, "Bucket", {});

		this.database = new cdk.aws_timestream.CfnDatabase(this, "Database", {});

		this.table = new cdk.aws_timestream.CfnTable(this, "Table", {
			databaseName: this.database.databaseName ?? "",
		});

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
