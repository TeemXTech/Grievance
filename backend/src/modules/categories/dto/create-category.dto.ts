import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsOptional, IsNumber } from "class-validator"

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  name_te?: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  parentId?: number
}
