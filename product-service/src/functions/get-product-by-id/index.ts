import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/getProductById.handler`,
  events: [
    {
      http: {
        method: "get",
        path: "products/{productId}",
        cors: true,
        request: {
          parameters: {
            paths: { productId: true },
          },
        },
      },
    },
  ],
};
