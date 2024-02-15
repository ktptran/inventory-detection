import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";

export class AuthStack extends cdk.Stack {
	public userPool: cdk.aws_cognito.UserPool;
	constructor(scope: Construct, id: string, props?: any) {
		super(scope, id, props);

		const { projectName } = props;

		this.userPool = new cdk.aws_cognito.UserPool(this, "UserPool", {
			autoVerify: { email: true },
			passwordPolicy: {
				minLength: 8,
				requireLowercase: false,
				requireDigits: false,
				requireUppercase: false,
				requireSymbols: false,
			},
		});

		const userPoolClient = new cdk.aws_cognito.UserPoolClient(
			this,
			"UserPoolClient",
			{
				generateSecret: false,
				userPool: this.userPool,
				userPoolClientName: `${projectName}-userPool`,
			}
		);

		const identityPool = new cdk.aws_cognito.CfnIdentityPool(
			this,
			"CognitoIdentityPool",
			{
				allowUnauthenticatedIdentities: false,
				cognitoIdentityProviders: [
					{
						clientId: userPoolClient.userPoolClientId,
						providerName: this.userPool.userPoolProviderName,
					},
				],
			}
		);

		const unauthenticatedRole = new cdk.aws_iam.Role(
			this,
			"CognitoDefaultUnauthenticatedRole",
			{
				assumedBy: new cdk.aws_iam.FederatedPrincipal(
					"cognito-identity.amazonaws.com",
					{
						StringEquals: {
							"cognito-identity.amazonaws.com:aud": identityPool.ref,
						},
						"ForAnyValue:StringLike": {
							"cognito-identity.amazonaws.com:amr": "unauthenticated",
						},
					},
					"sts:AssumeRoleWithWebIdentity"
				),
			}
		);
		unauthenticatedRole.addToPolicy(
			new cdk.aws_iam.PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				actions: ["mobileanalytics:PutEvents", "cognito-sync:*"],
				resources: ["*"],
			})
		);
		const authenticatedRole = new cdk.aws_iam.Role(
			this,
			"CognitoDefaultAuthenticatedRole",
			{
				assumedBy: new cdk.aws_iam.FederatedPrincipal(
					"cognito-identity.amazonaws.com",
					{
						StringEquals: {
							"cognito-identity.amazonaws.com:aud": identityPool.ref,
						},
						"ForAnyValue:StringLike": {
							"cognito-identity.amazonaws.com:amr": "authenticated",
						},
					},
					"sts:AssumeRoleWithWebIdentity"
				),
			}
		);
		authenticatedRole.addToPolicy(
			new cdk.aws_iam.PolicyStatement({
				effect: cdk.aws_iam.Effect.ALLOW,
				actions: [
					"mobileanalytics:PutEvents",
					"cognito-sync:*",
					"cognito-identity:*",
				],
				resources: ["*"],
			})
		);

		const defaultPolicy = new cdk.aws_cognito.CfnIdentityPoolRoleAttachment(
			this,
			"DefaultValid",
			{
				identityPoolId: identityPool.ref,
				roles: {
					unauthenticated: unauthenticatedRole.roleArn,
					authenticated: authenticatedRole.roleArn,
				},
			}
		);

		new cdk.CfnOutput(this, "CognitoRegion", {
			value: this.userPool.env.region,
			description: "Cognito user pool region.",
		});

		new cdk.CfnOutput(this, "CognitoUserPool", {
			value: this.userPool.userPoolId,
			description: "Cognito user pool ID",
		});

		new cdk.CfnOutput(this, "CognitoUserPoolWebClient", {
			value: userPoolClient.userPoolClientId,
			description: "Cognito user pool web client",
		});

		new cdk.CfnOutput(this, "CognitoIdentityPoolId", {
			value: identityPool.attrId,
			description: "Identity pool ID",
		});
	}
}
