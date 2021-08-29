import "source-map-support/register";
import {
  formatJSONResponse,
  InputAPIGatewayProxyEvent,
} from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import createHttpError from "http-errors";

import { ProductDaoService } from "@service/product-dao.service";
import { ProductServiceInterface } from "@service/product-service-interface";

export class GetProductByIdController {
  constructor(private service: ProductServiceInterface) {}

  handler: InputAPIGatewayProxyEvent = async (event, context) => {
    console.log("Incoming request", event);
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      const productId = event.pathParameters.productId;
      const product = await this.service.getById(productId);
      if (product) {
        return formatJSONResponse(200, product);
      } else {
        const response = new createHttpError.BadRequest(
          `Product with Id: '${productId}' not found`
        );
        return formatJSONResponse(response.statusCode, response.message);
      }
    } catch (error) {
      const isHttpError = createHttpError.isHttpError(error);
      if (isHttpError) {
        return formatJSONResponse(error.statusCode, error.message);
      } else {
        const response = new createHttpError.InternalServerError(error.message);
        return formatJSONResponse(response.statusCode, response.message);
      }
    }
  };
}

export const handler = middyfy(
  new GetProductByIdController(new ProductDaoService()).handler
);
