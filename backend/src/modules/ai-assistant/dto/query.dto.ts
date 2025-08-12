import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEnum } from "class-validator"
import { QueryType } from "../../../entities/ai-query.entity"

export class QueryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  query_text: string

  @ApiProperty({ enum: QueryType })
  @IsEnum(QueryType)
  query_type: QueryType
}
