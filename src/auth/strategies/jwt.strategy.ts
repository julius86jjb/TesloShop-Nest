import { PassportStrategy } from "@nestjs/passport"
import { ExtractJwt, Strategy } from "passport-jwt";
import { User } from "../entities/user.entity";
import { JwtPayload } from "../interfaces/jwt-payload.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Injectable, UnauthorizedException } from "@nestjs/common";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        configService: ConfigService
    ) {
        super({
            secretOrKey: configService.get('JWT_SECRET'),
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

        })
    }

    /* Se llama si Jwt no ha expirado y  si la firma hace match con el payload */

    async validate(payload: JwtPayload): Promise<User> {

        const { id } = payload

        const user = await this.userRepository.findOneBy({ id })

        if(!user) throw new UnauthorizedException('Token not valid')
        if(!user.isActive) throw new UnauthorizedException('User not active')

        // console.log({user})
        /* lo que se retorne aquíi,  se añade a la request (interceptores, servicios, controllers, ... tienen accesos a la req) */
        return user;
    }
}