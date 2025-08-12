import { Injectable, UnauthorizedException } from "@nestjs/common"
import type { JwtService } from "@nestjs/jwt"
import type { Repository } from "typeorm"
import * as bcrypt from "bcrypt"
import type { User } from "../../entities/user.entity"
import { type Role, RoleName } from "../../entities/role.entity"
import type { RegisterDto } from "./dto/register.dto"

@Injectable()
export class AuthService {
  private userRepository: Repository<User>
  private roleRepository: Repository<Role>
  private jwtService: JwtService

  constructor(userRepository: Repository<User>, roleRepository: Repository<Role>, jwtService: JwtService) {
    this.userRepository = userRepository
    this.roleRepository = roleRepository
    this.jwtService = jwtService
  }

  async validateUser(phone: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { phone },
      relations: ["role"],
    })

    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const { password_hash, ...result } = user
      return result
    }
    return null
  }

  async login(user: any) {
    const payload = { phone: user.phone, sub: user.id, role: user.role.name }
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role.name,
        language_pref: user.language_pref,
      },
    }
  }

  async register(registerDto: RegisterDto) {
    const { password, ...userData } = registerDto

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { phone: userData.phone },
    })

    if (existingUser) {
      throw new UnauthorizedException("User with this phone number already exists")
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Get default role
    const defaultRole = await this.roleRepository.findOne({
      where: { name: RoleName.VOLUNTEER },
    })

    // Create user
    const user = this.userRepository.create({
      ...userData,
      password_hash: hashedPassword,
      role: defaultRole,
    })

    const savedUser = await this.userRepository.save(user)

    // Return user without password
    const { password_hash, ...result } = savedUser
    return result
  }
}
