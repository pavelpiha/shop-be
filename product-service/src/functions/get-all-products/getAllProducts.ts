import "source-map-support/register";
import {
  ValidatedEventAPIGatewayProxyEvent,
  formatJSONResponse,
} from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import createHttpError from "http-errors";

import { ProductService } from "../../service/product-service";

export class GetAllProductsController {
  constructor(private service: ProductService) {}

  handler: ValidatedEventAPIGatewayProxyEvent = async () => {
    try {
      const products = await this.service.getAllProducts();
      return formatJSONResponse(200, products);
    } catch (error) {
      const response = new createHttpError.InternalServerError(error.message);
      return formatJSONResponse(response.statusCode, response.message);
    }
  };
}

export const getAllProducts = middyfy(
  new GetAllProductsController(new ProductService()).handler
);
