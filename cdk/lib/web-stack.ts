import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class WebStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		// Create S3 Bucket for our website
		const siteBucket = new cdk.aws_s3.Bucket(this, "SiteBucket", {
			websiteIndexDocument: "index.html",
			publicReadAccess: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const siteDistribution = new cdk.aws_cloudfront.CloudFrontWebDistribution(
			this,
			"SiteDistribution",
			{
				originConfigs: [
					{
						customOriginSource: {
							domainName: siteBucket.bucketWebsiteDomainName,
							originProtocolPolicy:
								cdk.aws_cloudfront.OriginProtocolPolicy.HTTP_ONLY,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
							},
						],
					},
				],
			}
		);

		new cdk.CfnOutput(this, "ImageBucket", {
			value: siteBucket.bucketName,
			description: "Image storage bucket name",
		});
	}
}
