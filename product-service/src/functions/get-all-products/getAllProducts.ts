import "source-map-support/register";
import {
  formatJSONResponse,
  InputAPIGatewayProxyEvent,
} from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import createHttpError from "http-errors";

import productServiceInstance from "../../service/product-service";
import { ProductServiceInterface } from "../../service/product-service-interface";

export class GetAllProductsController {
  constructor(private service: ProductServiceInterface) {}

  handler: InputAPIGatewayProxyEvent = async (event, context) => {
    console.log("Incoming request", event);
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      const products = await this.service.getAll();
      return formatJSONResponse(200, products);
    } catch (error) {
      const response = new createHttpError.InternalServerError(error.message);
      return formatJSONResponse(response.statusCode, response.message);
    }
  };
}

export const getAllProducts = middyfy(
  new GetAllProductsController(productServiceInstance).handler
);
