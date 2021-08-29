import "source-map-support/register";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import createHttpError from "http-errors";

import { Handler } from "aws-lambda/handler";
import { S3Event } from "aws-lambda";
import * as importFileService from "@service/import-file-service";

const handler: Handler<S3Event, any> = async (event) => {
  try {
    return await importFileService.handleImportedFiles(event.Records);
  } catch (error) {
    const response = new createHttpError.InternalServerError(error.message);
    return formatJSONResponse(response.statusCode, response.message);
  }
};

export const importFileParser = middyfy(handler);
