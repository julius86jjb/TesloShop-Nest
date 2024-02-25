import { AuthModule } from './../auth/auth.module';
import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ProductsModule } from 'src/products/products.module';
import { AuthService } from 'src/auth/auth.service';

@Module({
  controllers: [SeedController],
  providers: [SeedService, AuthService],
  imports: [
    ProductsModule,
    AuthModule
  ]
})
export class SeedModule {}
