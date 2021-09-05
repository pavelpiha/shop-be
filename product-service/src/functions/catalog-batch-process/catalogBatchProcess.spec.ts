import { catalogBatchProcess } from "./catalogBatchProcess";
import { ProductDaoService } from "../../service/product-dao.service";
import { SQSEvent } from "aws-lambda";
import { NotificationService } from "../../service/notification.service";

jest.mock("../../libs/apiGateway", () => ({
  formatJSONResponse: jest.fn((_obj, response) => {
    return response;
  }),
}));

jest.mock("../../service/product-dao.service", () => {
  const mockCreate = jest.fn().mockImplementation(async (product) => {
    return await new Promise((resolve) => resolve(product));
  });
  return {
    ProductDaoService: jest.fn().mockImplementation(() => {
      return { create: mockCreate };
    }),
  };
});

jest.mock("../../service/notification.service", () => {
  const mockNotify = jest.fn().mockImplementation(async (product) => {
    return await new Promise((resolve) => resolve(product));
  });
  return {
    NotificationService: jest.fn().mockImplementation(() => {
      return { notify: mockNotify };
    }),
  };
});

jest.mock("aws-sdk/clients/browser_default", () => {
  return {
    SNS: jest.fn().mockImplementation(() => ({
      publish: jest.fn().mockReturnThis(),
      promise: jest.fn(),
    })),
  };
});
const PRODUCT = {
  title: "123",
  description: "123",
  src: "123",
  price: 123,
  count: 123,
};

const EVENT = {
  Records: [
    {
      body: JSON.stringify(PRODUCT),
    },
  ],
} as unknown as SQSEvent;

describe("catalogBatchProcess", () => {
  it("should call ProductDaoService.create()", async () => {
    await catalogBatchProcess(EVENT);

    expect(ProductDaoService).toHaveBeenCalled();
  });
  it("should call notificationService.notify()", async () => {
    await catalogBatchProcess(EVENT);
    expect(NotificationService).toHaveBeenCalled();
  });
});
