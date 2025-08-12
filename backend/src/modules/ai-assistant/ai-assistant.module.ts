import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AiAssistantController } from "./ai-assistant.controller"
import { AiAssistantService } from "./ai-assistant.service"
import { AiQuery } from "../../entities/ai-query.entity"

@Module({
  imports: [TypeOrmModule.forFeature([AiQuery])],
  controllers: [AiAssistantController],
  providers: [AiAssistantService],
})
export class AiAssistantModule {}
