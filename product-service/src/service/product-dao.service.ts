import createHttpError from "http-errors";
import { Client, ClientConfig, QueryConfig, QueryResult } from "pg";
import { Product } from "../model/product-model";
import { ProductServiceInterface } from "./product-service-interface";

export type TProductData = Omit<Product, "id" | "count">;

const dbOptions: ClientConfig = {
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  connectionTimeoutMillis: 5000,
};

export class ProductDaoService implements ProductServiceInterface {
  private readonly SQL_GET_ALL_PRODUCTS =
    "SELECT p.id, p.title, p.description, p.image, p.price, s.count FROM products p LEFT JOIN stocks s on p.id = s.product_id";
  private readonly SQL_GET_PRODUCT_BY_ID =
    this.SQL_GET_ALL_PRODUCTS + " WHERE p.id = $1";
  private readonly CREATE_PRODUCT =
    "INSERT INTO products (title, description, image, price) VALUES ($1, $2, $3, $4) RETURNING *";
  private readonly CREATE_COUNT =
    "INSERT INTO stocks (product_id, count) VALUES ($1, $2) RETURNING count";
  private client: Client;

  public async getById(id: string): Promise<Product> {
    const uuidRegexp: RegExp =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isIdValid = uuidRegexp.test(id);
    if (isIdValid) {
      const result = await this.runQuery<Product>({
        text: this.SQL_GET_PRODUCT_BY_ID,
        values: [id],
      });
      return result.rows[0];
    } else {
      throw new createHttpError.BadRequest(`Wrong uuid: '${id}'`);
    }
  }

  public async getAll(): Promise<Product[]> {
    const result = await this.runQuery<Product>({
      text: this.SQL_GET_ALL_PRODUCTS,
    });
    return result.rows;
  }

  public async create(product: Product): Promise<Product> {
    await this.connectToDB();
    try {
      await this.client.query("BEGIN");
      const createProductResult = await this.client.query(this.CREATE_PRODUCT, [
        product.title,
        product.description,
        product.image,
        product.price,
      ]);
      const {
        rows: [createdProduct],
      } = createProductResult;
      const countResult = await this.client.query(this.CREATE_COUNT, [
        createdProduct.id,
        product.count,
      ]);
      await this.client.query("COMMIT");
      const {
        rows: [count],
      } = countResult;
      console.log("Product is created:", createdProduct);
      return {
        ...createdProduct,
        count: count,
      };
    } catch (error) {
      await this.client.query("ROLLBACK");
      console.error("Create product error: ", error);
    } finally {
      await this.closeDBConnection();
    }
  }

  private async runQuery<R>(query: QueryConfig) {
    await this.connectToDB();
    try {
      const result = await this.client.query<R>(query);
      console.log("result", result);
      return result;
    } catch (error) {
      console.error("Failed to execute query:", query);
      console.error("Error:", error);
      throw error;
    } finally {
      await this.closeDBConnection();
    }
  }

  private async connectToDB(): Promise<void> {
    this.client = new Client(dbOptions);
    await this.client.connect();
  }

  private async closeDBConnection(): Promise<void> {
    await this.client.end();
  }
}
