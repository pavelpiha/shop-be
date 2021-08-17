import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import csvParser from "csv-parser";
import { Readable } from "stream";

const BUCKET_NAME = "shop-csv-upload";
const s3Client = new S3Client({
  region: "eu-west-1",
});

export const handleImportedFiles = async (records): Promise<any> => {
  try {
    for (const record of records) {
      await saveProducts(record);
      await moveFileToParsedFolder(record);
    }
  } catch (error) {
    console.log("handleImportedFiles error was thrown", error);
    throw error;
  }
};

const moveFileToParsedFolder = async (record) => {
  await copyFileToParsedFolder(record);
  await deleteFromUploaded(record);
};

const saveProducts = async (record) => {
  try {
    const getObjectParams = {
      Bucket: BUCKET_NAME,
      Key: record.s3.object.key,
    };
    const command = new GetObjectCommand(getObjectParams);
    const item = await s3Client.send(command);
    const products = await readStream(item.Body);
    console.log(`saved products`, products);
  } catch (error) {
    console.log("saveProducts error was thrown", error);
    throw error;
  }
};

const readStream = (stream: Readable): Promise<any> => {
  const allRowsData = [];
  return new Promise((resolve, reject) => {
    stream
      .pipe(csvParser())
      .on("data", (row) => {
        console.log("row", row);
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
