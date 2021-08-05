import { QueryConfig, Pool } from "pg";
import type { Product } from "../model/product-model";
import { ProductServiceInterface } from "./product-service-interface";
import createHttpError from "http-errors";

const SQL_GET_ALL_PRODUCTS =
  "SELECT p.id, p.title, p.description, p.image, p.price, s.count FROM products p LEFT JOIN stocks s on p.id = s.product_id";
const SQL_GET_PRODUCT_BY_ID = SQL_GET_ALL_PRODUCTS + " WHERE p.id = $1";
const CREATE_PRODUCT =
  "INSERT INTO products (title, description, image, price) VALUES ($1, $2, $3, $4) RETURNING id";
const CREATE_COUNT = "INSERT INTO stocks (product_id, count) VALUES ($1, $2)";

const connectionPool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  idleTimeoutMillis: 20000,
});

class ProductService implements ProductServiceInterface {
  private clientPool: Pool = null;

  constructor(pool: Pool) {
    this.clientPool = pool;
  }

  async getAll() {
    const result = await this.runQuery<Product>({
      text: SQL_GET_ALL_PRODUCTS,
    });
    return result.rows;
  }

  async getById(id: string) {
    const uuidRegexp: RegExp =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isIdValid = uuidRegexp.test(id);
    if (isIdValid) {
      const result = await this.runQuery<Product>({
        text: SQL_GET_PRODUCT_BY_ID,
        values: [id],
      });
      return result.rows[0];
    } else {
      throw new createHttpError.BadRequest(`Wrong uuid: '${id}'`);
    }
  }

  async create(product: Omit<Product, "id">) {
    const result = await this.runTransactionQuery(product);
    return result.rows[0];
  }

  private async runTransactionQuery(product: Omit<Product, "id">) {
    const client = await this.clientPool.connect();
    try {
      await client.query("BEGIN");
      const res = await client.query(CREATE_PRODUCT, [
        product.title,
        product.description,
        product.image,
        product.price,
      ]);
      await client.query(CREATE_COUNT, [res.rows[0].id, product.count]);
      await client.query("COMMIT");
      return res;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  private async runQuery<R>(query: QueryConfig) {
    const client = await this.clientPool.connect();
    try {
      const result = await client.query<R>(query);
      console.log("result", result);
      return result;
    } catch (error) {
      console.log("Failed to execute query:", query);
      console.log("Error:", error);
      // throw error;
    } finally {
      client.release();
    }
  }
}

export const ProductServiceInstance: ProductService = new ProductService(
  connectionPool
);
