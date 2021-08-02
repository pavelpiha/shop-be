import { Product } from "../model/product-model";

export interface ProductServiceInterface {
  getAll: () => Promise<Product[]>;
  getById: (id: string) => Promise<Product>;
  create: (product: Omit<Product, "id">) => Promise<Pick<Product, "id">>;
}
