export default {
  type: "object",
  required: ["title", "description", "price", "count"],
  properties: {
    title: {
      type: 'string',
      description: 'Product title',
      minLength: 1,
    },
    description: {
      type: 'string',
      description: 'Product description',
    },
    image: {
      type: 'string',
      description: 'Product image',
    },
    price: {
      type: 'integer',
      description: 'Product price',
      minimum: 1,
    },
    count: {
      type: 'integer',
      description: 'Product count',
      minimum: 1,
    },
  },
  additionalProperties: false
} as const;
