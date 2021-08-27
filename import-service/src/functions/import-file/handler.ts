import "source-map-support/register";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { ValidatedEventAPIGatewayProxyEvent } from "@libs/apiGateway";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import createHttpError from "http-errors";

import schema from "./schema";

const handler: ValidatedEventAPIGatewayProxyEvent<typeof schema> = async (
  event
) => {
  try {
    const fileName = event.queryStringParameters.name;
    const getObjectParams = {
      Bucket: "shop-file-upload",
      Key: `uploaded/${fileName}`,
      ContentType: "text/csv",
    };
    const client = new S3Client({
      region: "eu-west-1",
    });
    const command = new PutObjectCommand(getObjectParams);
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });
    return formatJSONResponse(200, signedUrl);
  } catch (error) {
    const response = new createHttpError.InternalServerError(error.message);
    return formatJSONResponse(response.statusCode, response.message);
  }
};

export const importProductsFile = middyfy(handler);
