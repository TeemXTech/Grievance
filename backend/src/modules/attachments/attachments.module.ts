import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { AttachmentsController } from "./attachments.controller"
import { AttachmentsService } from "./attachments.service"
import { Attachment } from "../../entities/attachment.entity"
import { Request } from "../../entities/request.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Attachment, Request])],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
