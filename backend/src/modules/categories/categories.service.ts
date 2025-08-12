import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import type { Category } from "../../entities/category.entity"
import type { CreateCategoryDto } from "./dto/create-category.dto"

@Injectable()
export class CategoriesService {
  constructor(private categoryRepository: Repository<Category>) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoryRepository.create(createCategoryDto)
    return this.categoryRepository.save(category)
  }

  async findAll() {
    return this.categoryRepository.find({
      where: { is_active: true },
      relations: ["parent", "children"],
    })
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    })

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }

    return category
  }
}
