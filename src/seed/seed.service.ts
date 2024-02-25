import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from 'src/auth/auth.service';


@Injectable()
export class SeedService {

  constructor(
    private productsService: ProductsService,
    private userService: AuthService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) { }


  async runSeed() {

    await this.deleteTables()
    const adminUser = await this.insertUsers()
    await this.insertNewProduct(adminUser);

    return 'Seed Excecuted';
  }

  private async deleteTables() {
    await this.productsService.deleteAllProducts()
    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder
      .delete()
      .where({})
      .execute()
  }

  private async insertUsers( ) {
    this.userService.deleteAllUser();

    const seedUsers  = initialData.users;


    seedUsers .forEach( user => {
      this.userRepository.create(user)
    }) 

    const dbUsers = await this.userRepository.save( seedUsers  )

    return dbUsers[0];
  }


  // private async insertUsers() {

  //   this.userService.deleteAllUser();

  //   const seedUsers = initialData.users;
    
  //   const users: User[] = [];

  //   seedUsers.forEach( user => {
  //     users.push( this.userRepository.create( user ) )
  //   });

  //   const dbUsers = await this.userRepository.save( users )

  //   return dbUsers[0];
  // }


  private async insertNewProduct(user: User) {

    await this.productsService.deleteAllProducts()

    const productsSeed = initialData.products;

    const insertPromise = [];

    productsSeed.forEach(product => {
      insertPromise.push(this.productsService.create(product, user));
    });

    await Promise.all(insertPromise);

  }

}
