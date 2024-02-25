import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from "bcrypt";

import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { RegisterResponse } from './interfaces/register-response.interface';
import { LoginResponse } from './interfaces/login-response.interface';

@Injectable()
export class AuthService {


  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }
  async create(createUserDto: CreateUserDto): Promise<RegisterResponse> {
    try {

      const { password, ...userData } = createUserDto;


      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10)
      });

      await this.userRepository.save(user);

      delete user.password;

      return {
        user: user,
        token: this.getJwtToken({ id: user.id })
      }

    } catch (error) {
      this.handleDbException(error)
    }
  }

  async login(loginUserDto: LoginUserDto): Promise<LoginResponse> {

    const { password, email } = loginUserDto;

    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true }
    })

    if (!user)
      throw new UnauthorizedException(`Not valid credentials: email`)

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Not valid credentials: password`)


    return {
      user,
      token: this.getJwtToken({ id: user.id })
    };
  }

  

  async checkAuthStatus(user: User) {
    
    return {
      ...user,
      token: this.getJwtToken({ id: user.id })
    }
  }

  private getJwtToken(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }


  private handleDbException(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail)
    }

    console.log(error)

    throw new InternalServerErrorException('Internal Server Error - Checks logs')
  }

  async deleteAllUser() {

    try {
      await this.userRepository.createQueryBuilder().delete().where({}).execute()

    } catch (error) {
      this.handleDbException(error);
    }

  }
}
