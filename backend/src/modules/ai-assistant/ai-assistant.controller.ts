import { Controller, Post, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { AiAssistantService } from "./ai-assistant.service"
import type { QueryDto } from "./dto/query.dto"

@ApiTags("AI Assistant")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("ai-assistant")
export class AiAssistantController {
  constructor(private readonly aiAssistantService: AiAssistantService) {}

  @ApiOperation({ summary: "Query AI assistant" })
  @ApiResponse({ status: 200, description: "AI response" })
  @Post("query")
  query(queryDto: QueryDto) {
    return this.aiAssistantService.processQuery(queryDto)
  }
}
