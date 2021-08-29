import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/getAllProducts.handler`,
  events: [
    {
      http: {
        method: "get",
        path: "products",
        cors: true,
      },
    },
  ],
};
