import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty } from "class-validator"

export class AssignRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  assigneeId: string
}
