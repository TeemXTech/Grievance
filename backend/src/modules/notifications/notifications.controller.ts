import { Controller, Post, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { NotificationsService } from "./notifications.service"
import type { SendNotificationDto } from "./dto/send-notification.dto"

@ApiTags("Notifications")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("notifications")
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @ApiOperation({ summary: "Send notification" })
  @ApiResponse({ status: 200, description: "Notification sent successfully" })
  @Post("send")
  sendNotification(sendNotificationDto: SendNotificationDto) {
    return this.notificationsService.sendNotification(sendNotificationDto)
  }
}
