/* ref:
 * https://serverlessland.com/patterns/eventbridge-pipes-sqs-to-eventbridge-cdk
 * https://github.com/aws-samples/serverless-patterns/tree/main/eventbridge-pipes-sqs-to-eventbridge-cdk
 */
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { aws_lambda as _lambda } from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import { CfnPipe } from 'aws-cdk-lib/aws-pipes';

export class EventBridgePipesSimpleLoggerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create source (SQS)
    const source = new sqs.Queue(this, 'Source', {
      visibilityTimeout: cdk.Duration.seconds(60),
      retentionPeriod: cdk.Duration.seconds(60),
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Create enrichment (Lambda)
    const enrichment = new _lambda.Function(this, 'Enrichment', {
      code: _lambda.Code.fromAsset('lambda/'),
      handler: 'lambda_function.lambda_handler',
      runtime: _lambda.Runtime.PYTHON_3_9,
      architecture: _lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(5),
    });

    // Create target (CloudWatch Logs)
    const target = new logs.LogGroup(this, 'Target', {
      retention: logs.RetentionDays.THREE_DAYS,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Prepare policies for using Services
    const _queueArn = source.queueArn;
    const sourcePolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['sqs:ReceiveMessage', 'sqs:DeleteMessage', 'sqs:GetQueueAttributes'],
          resources: [_queueArn]
        })
      ]
    });
    const _functionArn = enrichment.functionArn;
    const enrichmentPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['lambda:InvokeFunction'],
          resources: [_functionArn]
        })
      ]
    });
    const _logGroupArn = target.logGroupArn;
    const targetPolicy = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          effect: iam.Effect.ALLOW,
          actions: ['logs:CreateLogStream', 'logs:PutLogEvents'],
          resources: [_logGroupArn]
        })
      ]
    });
    const runnerRole = new iam.Role(this, 'Role', {
      inlinePolicies: { sourcePolicy, enrichmentPolicy, targetPolicy },
      assumedBy: new iam.ServicePrincipal('pipes.amazonaws.com')
    });

    // Create pipe
    const _sourceArn = source.queueArn;
    const _enrichmentArn = enrichment.functionArn;
    const _targetArn = target.logGroupArn;
    const _roleArn = runnerRole.roleArn;
    const _ = new CfnPipe(this, 'Pipe', {
      source: _sourceArn,
      sourceParameters: {
        sqsQueueParameters: {
          batchSize: 1,
          maximumBatchingWindowInSeconds: 6
        },
      },
      enrichment: _enrichmentArn,
      enrichmentParameters: {},
      target: _targetArn,
      targetParameters: {
        cloudWatchLogsParameters: {}
      },
      roleArn: _roleArn
    });

  }
}
