import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException, Query } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { validate as isUUID } from "uuid";
import { ProductImage } from './entities';

@Injectable()
export class ProductsService {


  private readonly logger = new Logger('ProductsService');

  constructor(
    /* Con patrón repositorio */
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource
  ) {

  }
  async create(createProductDto: CreateProductDto) {

    // const producto = new Product() // otra forma de hacerlo -> pros: más facil, cons: hay que controlar mas cosas

    try {

      const { images = [], ...productDetails } = createProductDto

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map(image => this.productImageRepository.create({ url: image }))
      });

      await this.productRepository.save(product);

      return { ...product, images: images };

    } catch (error) {
      this.handleDBExceptions(error)

    }
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { limit = 10, offset = 0 } = paginationDto
      const products = await this.productRepository.find({
        take: limit,
        skip: offset,
        relations: {
          images: true,
        }
      })

      return products.map(product => ({
        ...product,
        images: product.images.map(img => img.url)
      }))
    } catch (error) {
      this.handleDBExceptions(error)
    }
  }

  async findOne(term: string) {

    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term })
    } else {
      // product = await this.productRepository.findOneBy({slug: term })

      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
      // :title y :slug van a ser argumentos que se definen en el segundo parametro como objeto -> {slug: term.toLowerCase(), ....}
        .where('UPPER(title) = :title or slug =:slug', { 
          slug: term.toLowerCase(),
          title: term.toUpperCase()
        })
        .leftJoinAndSelect('prod.images', 'prodImg')
        .getOne()

    }
    if (!product) throw new NotFoundException(`Product with term ${term} not found`)
    return product;
  }

  async findOnePlain(term: string) {
    const product = await this.findOne(term)

    return {
      ...product,
      images: product.images.map(img => img.url)
    }
  }

  async update(id: string, updateProductDto: UpdateProductDto) {

    const { images, ...toUpdate } = updateProductDto;


    const product = await this.productRepository.preload({ //preload no carga las relaciones
      id: id,
      ...toUpdate
    })

    if (!product) throw new NotFoundException(`Product with id ${id} not found`)

    // Create QueryRunner //

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // si viene objeto vacio es que quiere eliminar todas las imgs -> porque lo hemos decidido asi para nuestro endpoint
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: id })
        product.images = images.map(
          image => this.productImageRepository.create({ url: image })
        )
      } 
      //else {
      //   product.images = await this.productImageRepository.findBy({ product: { id: id } })
      // }

      await queryRunner.manager.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save(product)
      return this.findOnePlain(id);
      // return product;

    } catch (error) {

      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error)
    }


  }

  async remove(id: string) {
    const product = await this.findOne(id);

    await this.productRepository.remove(product);

  }

  async deleteAllProducts(){
    const query = this.productRepository.createQueryBuilder('product')

    try {
      return await query
        .delete()
        .where({})
        .execute()
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  private handleDBExceptions(error: any) {

    if (error.code === '23505')
      throw new BadRequestException(error.detail)

    this.logger.error(error)
    throw new InternalServerErrorException('Unexpected error');
  }
}
