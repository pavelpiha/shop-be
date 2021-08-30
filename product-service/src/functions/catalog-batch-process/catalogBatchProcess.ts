import "source-map-support/register";
import { formatJSONResponse } from "@libs/apiGateway";
import { middyfy } from "@libs/lambda";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { NotificationService } from "@service/notification.service";
import { Product } from "../../model/product-model";
import { ProductDaoService } from "../../service/product-dao.service";

export const catalogBatchProcess = async (event: SQSEvent) => {
  try {
    console.log("catalogBatchProcess lambda is executing", event.Records);
    const createdProducts = event.Records.map(async (record: SQSRecord) => {
      const product: Product = JSON.parse(record.body);
      const daoService = new ProductDaoService();
      const notificationService = new NotificationService();
      const savedProduct = await daoService.create(product);
      await notificationService.notify(savedProduct);
      return savedProduct;
    });
    return createdProducts;
  } catch (error) {
    return formatJSONResponse(500, error);
  }
};

export const handler = middyfy(catalogBatchProcess);
