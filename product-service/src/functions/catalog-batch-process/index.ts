import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(
    __dirname
  )}/catalog-batch-process.catalogBatchProcess`,
  events: [
    {
      sqs: {
        batchSize: 5,
        arn: "arn:aws:sqs:eu-west-1:368964351447:products-queue",
      },
    },
  ],
};
