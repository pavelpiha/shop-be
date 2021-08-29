import { SendMessageCommandOutput, SQS } from "@aws-sdk/client-sqs";
import { ProductDto } from "../dto/product.dto";

class QueueService {
  private queueURL: string = process.env.SQS_URL;
  private sqs: SQS = new SQS({ region: "eu-west-1" });

  async addToQueue(product: ProductDto): Promise<SendMessageCommandOutput> {
    console.log("addToQueue ", product);
    return await this.sqs.sendMessage({
      QueueUrl: this.queueURL,
      MessageBody: JSON.stringify(product),
    });
  }
}

export type { QueueService };
export default new QueueService();
