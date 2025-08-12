import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber } from "class-validator"
import { RequestType, Priority } from "../../../entities/request.entity"

export class CreateRequestDto {
  @ApiProperty({ enum: RequestType })
  @IsEnum(RequestType)
  type: RequestType

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  sub_type?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requester_name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requester_phone: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requester_address: string

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  geo_latitude?: number

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  geo_longitude?: number

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority)
  @IsOptional()
  priority?: Priority

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  categoryId?: number
}
