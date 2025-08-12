import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { User } from "../../entities/user.entity"

@Injectable()
export class UsersService {
  constructor(private userRepository: Repository<User>) {}

  async findAll() {
    return this.userRepository.find({
      relations: ["role"],
      select: ["id", "name", "phone", "email", "is_active", "created_at"],
    })
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ["role"],
      select: ["id", "name", "phone", "email", "is_active", "created_at"],
    })

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }

    return user
  }
}
