import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsEnum, IsString, IsNumber } from "class-validator"
import { Type } from "class-transformer"
import { RequestStatus, RequestType, Priority } from "../../../entities/request.entity"

export class RequestsFilterDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(RequestType)
  type?: RequestType

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  assignedTo?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number

  @ApiProperty({ required: false, default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number
}
