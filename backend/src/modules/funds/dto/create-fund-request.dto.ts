import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsNumber } from "class-validator"

export class CreateFundRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  requestId: string

  @ApiProperty()
  @IsNumber()
  amount: number

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  purpose: string
}
