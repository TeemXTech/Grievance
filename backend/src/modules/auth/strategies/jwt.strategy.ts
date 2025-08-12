import { ExtractJwt, Strategy } from "passport-jwt"
import { PassportStrategy } from "@nestjs/passport"
import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { User } from "../../../entities/user.entity"

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private userRepository: Repository<User>

  constructor(userRepository: Repository<User>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "your-secret-key",
    })
    this.userRepository = userRepository
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ["role"],
    })
    return user
  }
}
