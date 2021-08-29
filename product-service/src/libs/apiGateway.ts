import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";
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
