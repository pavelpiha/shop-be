import "source-map-support/register";
import {
  APIGatewayAuthorizerResult,
  APIGatewayTokenAuthorizerHandler,
} from "aws-lambda";

import { middyfy } from "@libs/lambda";

const handler: APIGatewayTokenAuthorizerHandler = (event, _, callback) => {
  if (event.type !== "TOKEN") {
    callback("Unauthorized");
    console.error("No authorization header");
  }
  try {
    console.log("Received event:", JSON.stringify(event, null, 2));
    const authorizationToken: string = event.authorizationToken;
    const encodedCredentials: string = authorizationToken.split(" ")[1];
    const buffer: Buffer = Buffer.from(encodedCredentials, "base64");
    const plainCredentials: string[] = buffer.toString("utf-8").split(":");
    const userName: string = plainCredentials[0];
    const password: string = plainCredentials[1];

    console.log("userName: ", userName, " and password: ", password);

    const storedUserPassword: string = process.env[userName];
    const effect: PolicyAction =
      !storedUserPassword || storedUserPassword !== password
        ? PolicyAction.DENY
        : PolicyAction.ALLOW;
    const policy = generatePolicy(encodedCredentials, event.methodArn, effect);
    callback(null, policy);
  } catch (error) {
    console.error("Error", error);
    callback("Unauthorized");
  }
};

const enum PolicyAction {
  DENY = "Deny",
  ALLOW = "Allow",
}

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: string
): APIGatewayAuthorizerResult => {
  console.log("!!!!!!!!!!!!!");
  console.log("principalId", principalId);
  console.log("resource", resource);
  console.log("effect", effect);
  return {
    principalId: principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
};
//   return {
//     principalId: principalId, // The principal user identification associated with the token sent by the client.
//     policyDocument: {
//       Version: "2012-10-17",
//       Statement: [
//         {
//           Action: "execute-api:Invoke",
//           Effect: "Allow|Deny",
//           Resource: "arn:aws:execute-api:<regionId>:<accountId>:<appId>/<stage>/<httpVerb>/[<resource>/<httpVerb>/[...]]"
//         }
//       ]
//     }
//   }
// };

export const main = middyfy(handler);
