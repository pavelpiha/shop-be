import { GetProductByIdController } from "./getProductById";
import { ProductService } from "../../service/product-service";

import { formatJSONResponse } from "../../libs/apiGateway";
import { APIGatewayProxyEvent } from "aws-lambda";

const mockData = [
  { id: "1", title: "test1" },
  { id: "2", title: "test2" },
  { id: "3", title: "test3" },
];
const mockError = new Error("An Error was thrown");
const mockEvent: APIGatewayProxyEvent = {
  pathParameters: {
    productId: "1",
  },
} as any as APIGatewayProxyEvent;

const productService: ProductService = {
  getAllProducts: jest.fn(() => Promise.resolve(mockData)),
  getProductById: jest.fn(() => Promise.resolve(mockData[0])),
} as any as ProductService;

const productServiceWithWrongId: ProductService = {
  getAllProducts: jest.fn(() => Promise.resolve(mockData)),
  getProductById: jest.fn(() => undefined),
} as any as ProductService;

const productServiceWithError: ProductService = {
  getAllProducts: jest.fn(() => Promise.reject(mockError)),
  getProductById: jest.fn(() => Promise.reject(mockError)),
} as any as ProductService;

jest.mock("../../libs/apiGateway", () => ({
  formatJSONResponse: jest.fn((_obj, response) => {
    return response;
  }),
}));

describe("getAllProducts", () => {
  let getProductByIdController: GetProductByIdController;

  beforeEach(() => {
    jest.clearAllMocks();
    getProductByIdController = new GetProductByIdController(productService);
  });

  test("should return correct products list", async () => {
    const response = await getProductByIdController.handler(
      mockEvent,
      null,
      null
    );
    expect(response).toEqual(mockData[0]);
  });

  test("should call formatJSONResponse once with correct value", async () => {
    await getProductByIdController.handler(mockEvent, null, null);
    expect(formatJSONResponse).nthCalledWith(1, 200, mockData[0]);
  });

  test("should return an Error message in case of wrong Id", async () => {
    getProductByIdController = new GetProductByIdController(
      productServiceWithWrongId
    );
    const mockEventWithWrongId: APIGatewayProxyEvent = {
      pathParameters: {
        productId: "5",
      },
    } as any as APIGatewayProxyEvent;
    const response = await getProductByIdController.handler(
      mockEventWithWrongId,
      null,
      null
    );
    expect(response).toEqual('Product with Id: \'5\' not found');
  });

  test("should return an Error message in case of error", async () => {
    getProductByIdController = new GetProductByIdController(
      productServiceWithError
    );
    const response = await getProductByIdController.handler(
      mockEvent,
      null,
      null
    );
    expect(response).toEqual(mockError.message);
  });
});
