import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class WebStack extends cdk.Stack {
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		// Create S3 Bucket for our website
		const siteBucket = new cdk.aws_s3.Bucket(this, "SiteBucket", {
			websiteIndexDocument: "index.html",
			websiteErrorDocument: "index.html",
			publicReadAccess: false,
			autoDeleteObjects: true,
			removalPolicy: cdk.RemovalPolicy.DESTROY,
		});

		const cloudfrontOAI = new cdk.aws_cloudfront.OriginAccessIdentity(
			this,
			"CloudFrontOAI",
			{
				comment: "Cloudfront OAI",
			}
		);

		siteBucket.addToResourcePolicy(
			new cdk.aws_iam.PolicyStatement({
				sid: "s3BucketPublicRead",
				effect: cdk.aws_iam.Effect.ALLOW,
				actions: ["s3:GetObject"],
				resources: [`${siteBucket.bucketArn}/*`],
				principals: [
					new cdk.aws_iam.CanonicalUserPrincipal(
						cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
					),
				],
			})
		);

		const siteDistribution = new cdk.aws_cloudfront.CloudFrontWebDistribution(
			this,
			"SiteDistribution",
			{
				originConfigs: [
					{
						s3OriginSource: {
							s3BucketSource: siteBucket,
							originAccessIdentity: cloudfrontOAI,
						},
						behaviors: [
							{
								isDefaultBehavior: true,
								compress: true,
								allowedMethods:
									cdk.aws_cloudfront.CloudFrontAllowedMethods.GET_HEAD_OPTIONS,
							},
						],
					},
				],
			}
		);

		new cdk.CfnOutput(this, "SiteBucketName", {
			value: siteBucket.bucketName,
			description: "Web storage bucket name",
		});

		new cdk.CfnOutput(this, "CloudFrontDistributionDomainName", {
			value: siteDistribution.distributionDomainName,
			description: "CloudFront distribution domain name.",
		});

		new cdk.CfnOutput(this, "CloudFrontDistributionId", {
			value: siteDistribution.distributionId,
			description: "CloudFront distribution id.",
		});
	}
}
