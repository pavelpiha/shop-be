import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { S3EventRecord } from "aws-lambda";
import { validateSync, ValidationError } from "class-validator";
import csvParser from "csv-parser";
import createHttpError from "http-errors";
import { Readable } from "stream";
import { ProductDto } from "../dto/product.dto";
import queueService from "./queue.service";

const BUCKET_NAME = "shop-file-upload";
const s3Client = new S3Client({
  region: "eu-west-1",
});

export const handleImportedFiles = async (
  records: S3EventRecord[]
): Promise<any> => {
  const promisesWithProducts = records.map((record) => {
    return processImportedFile(record);
  });
  const productsArray = await Promise.all(promisesWithProducts);
  const result = productsArray.flat();
  console.log("handleImportedFiles result", result);
  return result;
};

const processImportedFile = async (record: S3EventRecord) => {
  try {
    const name = record.s3.object.key;
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: name,
    };
    const command = new GetObjectCommand(getObjectParams);
    const item = await s3Client.send(command);
    const products: ProductDto[] = await readStream(item.Body);
    const validationErrors: ValidationError[][] | null =
      validateProducts(products);

    if (validationErrors) {
      console.error(`Validation failed for ${name}`, validationErrors);
    } else {
      await moveFileToParsedFolder(record);
      products.forEach(async (product: ProductDto) => {
        await queueService.addToQueue(product);
      });
      return products;
    }
  } catch (error) {
    console.error("processImportedFile error was thrown", error);
    throw error;
  }
};

const moveFileToParsedFolder = async (record) => {
  await copyFileToParsedFolder(record);
  await deleteFromUploaded(record);
};

const readStream = (stream: Readable): Promise<any> => {
  const allRowsData = [];
  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        allRowsData.push(row);
      })
      .on("end", () => {
        resolve(allRowsData);
      })
      .on("error", (error) => {
        reject(error);
      });
  });
};

export const validateProducts = (
  data: ProductDto[]
): ValidationError[][] | null => {
  let hasErrors = false;
  const validationErrors = data.map((data) => {
    const dtoInstance: ProductDto = new ProductDto(data);
    console.log("dtoInstance ", dtoInstance);
    const errors: ValidationError[] = validateSync(dtoInstance);
    if (errors.length) hasErrors = true;
    return errors;
  });

  return hasErrors ? validationErrors : null;
};

export const copyFileToParsedFolder = async (record) => {
  const commandParameters = {
    Bucket: record.s3.bucket.name,
    CopySource: encodeURI(`${record.s3.bucket.name}/${record.s3.object.key}`),
    Key: record.s3.object.key.replace("uploaded", "parsed"),
  };
  const command = new CopyObjectCommand(commandParameters);
  return await s3Client.send(command);
};

export const deleteFromUploaded = async (record) => {
  const commandParameters = {
    Bucket: BUCKET_NAME,
    Key: record.s3.object.key,
  };
  const command = new DeleteObjectCommand(commandParameters);
  return await s3Client.send(command);
};
