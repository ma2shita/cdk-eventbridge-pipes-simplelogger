# AWS CDKv2 example: SQS to CloudWatch Logs (w/ Enrichment by Lambda) on Amazon EventBridge Pipes

![architecture](https://docs.google.com/drawings/d/e/2PACX-1vTOWHai0EUAi4y3qwHIbEAz-DWn9qmCRL1qp6PK8oYl5ounc96uVSZwKJAjbD0aCUHpt05a0bUfHkEG/pub?w=921&h=345)

Example an AWS CDKv2 for building the Amazon EventBridge Pipes that logs messages sent to an SQS queue to CloudWatch Log.  
It also includes an enrichment(but pass-throught) by a Lambda function.

(ja) SQSキューに送信されたメッセージをCloudWatch Logにログ出力するAmazon EventBridge Pipesを構築する、AWS CDKv2 のサンプル。  
Lambda関数による強化(enrichment/内容は"何もしない")も含んでいます。

Created by:

* Queue (1)
* Log Group (1)
* Lambda function (1)
* Pipe (1)

## Requirements

* AWS CDKv2 env.
    * `cdk bootstrap` must be done

## Build & Deploy

Build:

```
git clone https://github.com/ma2shita/eventbridge-pipes-simplelogger
cd eventbridge-pipes-simplelogger/
npm install
npm run build
```

Deploy:

```
cdk deploy
```

> **Note**
> The target region is set to us-west-2. This is specified in `bin/event_bridge_pipes_simple_logger.ts`.

## How it works

Send SQS queue message then will record toeven CloudWatch Log.  
At the same time, the Lambda function specified for the enrichment is also logged.

(ja) SQS queue にメッセージを送信すると、CloudWatch Logに記録されます。  
同時に、強化に指定されているLambda関数もログに記録されます。

## References and special thanks!!

* https://serverlessland.com/patterns/eventbridge-pipes-sqs-to-eventbridge-cdk
* https://github.com/aws-samples/serverless-patterns/tree/main/eventbridge-pipes-sqs-to-eventbridge-cdk

## Related

* (construction) AWS CDKv2 samples of AWS IoT 1-Click projects and Lambda functions that send messages to an existing SQS queue

## License

Copyright (c) 2023 Kohei "Max" MATSUSHITA.

SPDX-License-Identifier: MIT

EoT
