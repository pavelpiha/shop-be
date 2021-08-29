import type { AWS } from "@serverless/typescript";

import getAllProducts from "@functions/get-all-products";
import getProductById from "@functions/get-product-by-id";
import createProduct from "@functions/create-product";
import catalogBatchProcess from "@functions/catalog-batch-process";
import documentation from "./serverless.doc";
import dbConfig from "./config";

const serverlessConfiguration: AWS = {
  service: "product-service",
  frameworkVersion: "2",
  configValidationMode: "error",
  useDotenv: true,
  custom: {
    webpack: {
      webpackConfig: "./webpack.config.js",
      includeModules: true,
    },
    dbConfig,
    documentation,
    emailToNotify: "${self:custom.dbConfig.NOTIFY_EMAIL, env:NOTIFY_EMAIL, ''}",
    productsSqsName: "products-queue",
    emailWithNoFilter:
      "${self:custom.dbConfig.NOTIFY_NO_FILTER_EMAIL, env:NOTIFY_NO_FILTER_EMAIL, ''}",
  },
  plugins: ["serverless-webpack", "serverless-offline"],
  provider: {
    name: "aws",
    runtime: "nodejs14.x",
    stage: "dev",
    region: "eu-west-1",
    apiGateway: {
      minimumCompressionSize: 1024,
      shouldStartNameWithService: true,
    },
    environment: {
      AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
      DB_HOST: "${self:custom.dbConfig.DB_HOST, env:DB_HOST, ''}",
      DB_DATABASE: "${self:custom.dbConfig.DB_DATABASE, env:DB_DATABASE, ''}",
      DB_USER: "${self:custom.dbConfig.DB_USER, env:DB_USER, ''}",
      DB_PASSWORD: "${self:custom.dbConfig.DB_PASSWORD, env:DB_PASSWORD, ''}",
      // SQS_URL: {
      //   Ref: "SQSQueue",
      // },
      SNS_ARN: {
        Ref: "SNSTopic",
      },
    },
    lambdaHashingVersion: "20201221",
    iam: {
      role: {
        statements: [
          {
            Effect: "Allow",
            Action: "sqs:*",
            Resource: "arn:aws:sns:eu-west-1:368964351447:products-created",
          },
          {
            Effect: "Allow",
            Action: "sns:*",
            Resource: { Ref: "SNSTopic" },
          },
        ],
      },
    },
  },
  functions: {
    getAllProducts,
    getProductById,
    createProduct,
    catalogBatchProcess,
  },

  resources: {
    Resources: {
      // SQSQueue: {
      //   Type: "AWS::SQS::Queue",
      //   Properties: {
      //     QueueName: "products-queue",
      //   },
      // },
      SNSTopic: {
        Type: "AWS::SNS::Topic",
        Properties: {
          TopicName: "products-created",
        },
      },
      SNSSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "${self:custom.emailWithNoFilter}",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
        },
      },
      SNSTitleFilterSubscription: {
        Type: "AWS::SNS::Subscription",
        Properties: {
          Endpoint: "${self:custom.emailToNotify}",
          Protocol: "email",
          TopicArn: {
            Ref: "SNSTopic",
          },
          FilterPolicy: {
            hasTitle: ["true"],
          },
        },
      },
    },
  },
};

module.exports = serverlessConfiguration;
