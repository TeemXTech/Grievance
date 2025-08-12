import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsEnum } from "class-validator"
import { LanguagePreference } from "../../../entities/user.entity"

export class RegisterDto {
  @ApiProperty({ example: "John Doe" })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: "+919876543210" })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({ example: "john@example.com", required: false })
  @IsEmail()
  @IsOptional()
  email?: string

  @ApiProperty({ example: "password123" })
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty({ enum: LanguagePreference, default: LanguagePreference.ENGLISH })
  @IsEnum(LanguagePreference)
  @IsOptional()
  language_pref?: LanguagePreference
}
