import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export interface WebAclStackProps extends cdk.StackProps {
	projectName: string;
	environment: string;
	accountId: string;
	region: string;
}

export class WebAclStack extends cdk.Stack {
	public webAcl: cdk.aws_wafv2.CfnWebACL;
	constructor(scope: Construct, id: string, props: WebAclStackProps) {
		super(scope, id, props);

		const { environment, projectName, region } = props;

		this.webAcl = new cdk.aws_wafv2.CfnWebACL(this, "CDKWebAcl", {
			defaultAction: {
				allow: {},
			},
			scope: "REGIONAL",
			visibilityConfig: {
				cloudWatchMetricsEnabled: true,
				metricName: "MetricForWebAclCDK",
				sampledRequestsEnabled: true,
			},
			name: `${environment}-${projectName}-${region}-webAcl`,
			rules: [
				{
					name: "CRSRule",
					priority: 0,
					statement: {
						managedRuleGroupStatement: {
							name: "AWSManagedRulesCommonRuleSet",
							vendorName: "AWS",
						},
					},
					visibilityConfig: {
						cloudWatchMetricsEnabled: true,
						metricName: "MetricForWebACLCDK-CRS",
						sampledRequestsEnabled: true,
					},
					overrideAction: {
						none: {},
					},
				},
			],
		});

		new cdk.CfnOutput(this, "WebACLName", {
			value: this.webAcl.name ?? "",
			description: "Web storage bucket name",
		});

		new cdk.CfnOutput(this, "WebACLId", {
			value: this.webAcl.attrId,
			description: "Web ACL Id",
		});
	}
}
