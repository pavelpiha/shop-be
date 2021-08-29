import { SNS } from "@aws-sdk/client-sns";
import { Product } from "../model/product-model";

const FILTER_TITLES = ["sony"];
// const FILTER_TITLES = "sony";
class NotificationService {
  private topicArn: string = process.env.SNS_ARN;
  private sns: SNS = new SNS({ region: "eu-west-1" });

  async notify(product: Product): Promise<void> {
    console.log("notify!!!!!!!!!!!!!!!!");
    await this.sns.publish(
      {
        Subject: "Imported file processing info",
        Message: `Product ${product.title} successfully added to DB`,
        TopicArn: this.topicArn,
        MessageAttributes: {
          hasTitle: {
            DataType: "String",
            StringValue: `${this.filterByTitle(product, FILTER_TITLES)}`,
            // StringValue: `${product.title.toLowerCase().includes(FILTER_TITLES)}`,
          },
        },
      },
      () => {
        console.log("notify callback!!!!!!!", product);
      }
    );
  }

  filterByTitle(product: Product, filterTitles: string[]): boolean {
    let result = filterTitles.some((title) =>
      product.title.toLowerCase().includes(title)
    );
    console.log("filterByTitle!!!!", result);
    return result;
  }
}

export default new NotificationService();
