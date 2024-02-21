import { Inject, Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';


@Injectable()
export class SeedService {

  constructor(
    private productsService: ProductsService
  ) { }


  async runSeed() {

    await this.insertNewProduct();

    return 'Seed Excecuted';
  }


  private async insertNewProduct() {

    await this.productsService.deleteAllProducts()

    const products = initialData.products;

    const insertPromise = [];

    products.forEach(product => {
      insertPromise.push(this.productsService.create(product));
    });

    await Promise.all(insertPromise);

  }

}
