import { handlerPath } from "@libs/handlerResolver";

export default {
  handler: `${handlerPath(__dirname)}/getAllProducts.getAllProducts`,
  events: [
    {
      http: {
        method: "get",
        path: "products",
        cors: true,
      },
    },
  ],
  documentation: {
    summary: "List of products",
    description: "Returns list of products",
    methodResponses: [
      {
        statusCode: 200,
        responseBody: {
          description: "List of products",
        },
        responseModels: {
          "application/json": "ProductListResponse",
        },
      },
      {
        statusCode: 500,
        responseBody: {
          description: "An error retrieving product list",
        },
        responseModels: {
          "application/json": "ErrorResponse",
        },
      },
    ],
  },
};
