import { QueryConfig, Pool } from "pg";
import type { Product } from "../model/product-model";
import { ProductServiceInterface } from "./product-service-interface";

const SQL_GET_ALL_PRODUCTS =
  "SELECT p.id, p.title, p.description, p.image, p.price, s.count FROM products p LEFT JOIN stocks s on p.id = s.product_id";
const SQL_GET_PRODUCT_BY_ID = SQL_GET_ALL_PRODUCTS + " WHERE p.id = $1";
const SQL_CREATE_PRODUCT =
  "WITH rows AS " +
  "(INSERT INTO products (title, description, image, price) VALUES ($1, $2, $3, $4) RETURNING id) INSERT " +
  "INTO stocks (product_id, count) SELECT id, $5 FROM rows RETURNING product_id as id";
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
    const result = await this.runQuery<Product>({
      text: SQL_GET_PRODUCT_BY_ID,
      values: [id],
    });
    return result.rows[0];
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
    try {
      const client = await this.clientPool.connect();
      try {
        return await client.query<R>(query);
      } catch (error) {
        console.log("Failed to execute query:", query);
        console.log("Error:", error);
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.log("Failed to get connection:", error);
      throw error;
    }
  }
}

export const ProductServiceInstance: ProductService = new ProductService(
  connectionPool
);
