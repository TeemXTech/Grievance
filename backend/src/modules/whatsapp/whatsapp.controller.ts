import { Controller, Get, Post, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { WhatsappService } from "./whatsapp.service"

@ApiTags("WhatsApp")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("whatsapp")
export class WhatsappController {
  constructor(private readonly whatsappService: WhatsappService) {}

  @ApiOperation({ summary: "Get pending WhatsApp messages" })
  @ApiResponse({ status: 200, description: "List of pending messages" })
  @Get("pending")
  getPendingMessages() {
    return this.whatsappService.getPendingMessages()
  }

  @ApiOperation({ summary: "Approve WhatsApp message" })
  @ApiResponse({ status: 200, description: "Message approved successfully" })
  @Post(":id/approve")
  approveMessage(id: string) {
    return this.whatsappService.approveMessage(+id)
  }
}
