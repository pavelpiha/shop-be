import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from "aws-lambda";

interface NameEvent {
  fullName: string;
}
interface NameResult {
  firstName: string;
  middleNames: string;
  lastName: string;
}
export type ValidatedEventAPIGatewayProxyEvent = Handler<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
>;

export type PersonHandler = Handler<NameEvent, NameResult>;

export const formatJSONResponse = (statusCode: number, response: Object) => {
  return {
    statusCode: statusCode,
    body: JSON.stringify(response),
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  };
};
