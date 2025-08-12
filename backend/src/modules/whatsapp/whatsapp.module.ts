import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { WhatsappController } from "./whatsapp.controller"
import { WhatsappService } from "./whatsapp.service"
import { WhatsappMessage } from "../../entities/whatsapp-message.entity"
import { Request } from "../../entities/request.entity"

@Module({
  imports: [TypeOrmModule.forFeature([WhatsappMessage, Request])],
  controllers: [WhatsappController],
  providers: [WhatsappService],
})
export class WhatsappModule {}
