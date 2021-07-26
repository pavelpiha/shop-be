import { Product } from "../model/product-model";
import mockData from "./products.json";

export class ProductService {
  getAllProducts(): Promise<Product[]> {
    return Promise.resolve(mockData);
  }

  getProductById(id: string): Promise<Product> {
    return this.getAllProducts().then((products) => {
      return products.find((product) => product.id === id);
    });
  }
}
