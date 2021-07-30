const errorSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "string",
};

const notFoundSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "string",
};

const productModel = {
  description: "Product",
  type: "object",
  properties: {
    id: {
      type: "string",
      description: "Product identifier in form of UUID",
    },
    title: {
      type: "string",
      description: "Product title",
    },
    description: {
      type: "string",
      description: "Product description",
    },
    price: {
      type: "number",
      description: "Product price",
    },
    count: {
      type: "number",
      description: "Product count",
    },
    img: {
      type: "string",
      description: "Product image",
    },
  },
  additionalProperties: false,
};

const productSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  ...productModel,
};

const productListSchema = {
  $schema: "http://json-schema.org/draft-04/schema#",
  type: "array",
  items: {
    $ref: "#/definitions/product",
  },
  uniqueItems: true,
  additionalProperties: false,
  definitions: {
    product: productModel,
  },
};

export default {
  version: "1.0.0",
  title: "Products Service API",
  models: [
    {
      name: "ErrorResponse",
      description: "This is an error",
      contentType: "application/json",
      schema: errorSchema,
    },
    {
      name: "NotFoundResponse",
      description: "Response in case when no product was found",
      contentType: "application/json",
      schema: notFoundSchema,
    },
    {
      name: "ProductResponse",
      description: "Product",
      contentType: "application/json",
      schema: productSchema,
    },
    {
      name: "ProductListResponse",
      description: "List of Products",
      contentType: "application/json",
      schema: productListSchema,
    },
  ],
};
