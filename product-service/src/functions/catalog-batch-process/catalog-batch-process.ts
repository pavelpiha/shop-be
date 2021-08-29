import "source-map-support/register";
import { formatJSONResponse, tryCatch } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { SQSEvent, SQSHandler, SQSRecord } from "aws-lambda";
import notificationService from "@service/notification.service";
import productServiceInstance from "@service/product-service";
import { Product } from "../../model/product-model";

export const handler = async (event: SQSEvent) => {
  try {
    console.log("catalogBatchProcess lambda is executing", {
      records: event.Records,
    });

    const addedProducts = event.Records.map(async (record) => {
      const product: Product = JSON.parse(record.body);
      console.log(product);
      try {
        await productServiceInstance.create(product);
      } catch (error) {
        console.log("addProductToDb fail: ", JSON.stringify(error));
      }
      console.log(`sending sns.publish (product.title = ${product.title})`);
      await notificationService.notify(product);
      return product;
    });

    return formatJSONResponse(200, addedProducts);
  } catch (error) {
    return formatJSONResponse(500, error);
  }
};
// tryCatch(async () => {
//   // const products: Product[] = event.Records.map((record: SQSRecord) =>
//   //   JSON.parse(record.body)
//   // );
//   // const savedProducts = await productServiceInstance.insertAllProducts(
//   //   products
//   // );
//   // console.log("savedProducts!!!!!!!!!!!!!!!!", savedProducts);
//   // products.forEach(async (product) => {
//   //   await notificationService.notify(product);
//   // });
//   // // for (const record of event.Records) {
//   // //   const notificationMessage: NotificationMessage = JSON.parse(record.body);
//   // //   const savedProduct = await productServiceInstance.create(
//   // //     notificationMessage.product
//   // //   );
//   // //     console.log("@@@@@@@@@@@catalogBatchProcess");
//   // //     return await notificationService.notify(notificationMessage);
//   // //      savedProduct;
//   // // }
//   // return savedProducts;
// });

export const catalogBatchProcess = middyfy(handler);
