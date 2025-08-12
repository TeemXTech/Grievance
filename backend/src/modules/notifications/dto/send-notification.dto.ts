import { ApiProperty } from "@nestjs/swagger"
import { IsString, IsNotEmpty, IsEnum } from "class-validator"

enum NotificationType {
  SMS = "SMS",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
}

export class SendNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  recipient: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string

  @ApiProperty({ enum: NotificationType })
  @IsEnum(NotificationType)
  type: NotificationType
}
