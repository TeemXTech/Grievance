import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class LoginDto {
  @ApiProperty({ example: "+919876543210" })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string
}
