import { handlerPath } from "@libs/handlerResolver";
import schema from "./schema";

export default {
  handler: `${handlerPath(__dirname)}/createProduct.handler`,
  events: [
    {
      http: {
        method: "post",
        path: "products",
        cors: {
          origins: "*",
          headers: "*",
          methods: ["POST", "OPTIONS"],
        },
        request: {
          schema: {
            "application/json": schema,
          },
        },
      },
    },
  ],
};
