import "source-map-support/register";
import {
  ValidatedAPIGatewayProxyEvent,
  formatJSONResponse,
  ParsedAPIGatewayProxyEvent,
} from "../../libs/apiGateway";
import { middyfy } from "../../libs/lambda";
import createHttpError from "http-errors";

import productServiceInstance from "@service/product-service";
import { ProductServiceInterface } from "@service/product-service-interface";
import schema from "./schema";

export type CreateProductEvent = ParsedAPIGatewayProxyEvent<typeof schema>;

export class CreateProductController {
  constructor(private service: ProductServiceInterface) {}

  handler: ValidatedAPIGatewayProxyEvent<typeof schema> = async (
    { body }: CreateProductEvent,
    context
  ) => {
    console.log("Incoming request body", body);
    context.callbackWaitsForEmptyEventLoop = false;
    try {
      const product = await this.service.create(body);
      if (product) {
        return formatJSONResponse(200, product);
      } else {
        const response = new createHttpError.BadRequest(
          `Product does not created`
        );
        return formatJSONResponse(response.statusCode, response.message);
      }
    } catch (error) {
      const response = new createHttpError.InternalServerError(error.message);
      return formatJSONResponse(response.statusCode, response.message);
    }
  };
}

export const handler = middyfy(
  new CreateProductController(productServiceInstance).handler
);
