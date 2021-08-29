import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
import createHttpError from "http-errors";
import type { FromSchema } from "json-schema-to-ts";

export type InputAPIGatewayProxyEvent = Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>;
export type ParsedAPIGatewayProxyEvent<S> = Omit<
  APIGatewayProxyEvent,
  "body"
> & { body: FromSchema<S> };

export type ValidatedAPIGatewayProxyEvent<S> = Handler<
  ParsedAPIGatewayProxyEvent<S>,
  APIGatewayProxyResult
>;

export const formatJSONResponse = (statusCode: number, response: Object) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(response),
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS, PUT, PATCH, DELETE",
    },
  };
};
export async function tryCatch(callBack: () => Promise<any>): Promise<any> {
  try {
    return await callBack();
  } catch (error) {
    console.error(error);
    const response = new createHttpError.InternalServerError(error.message);
    return formatJSONResponse(response.statusCode, response.message);
  }
}
