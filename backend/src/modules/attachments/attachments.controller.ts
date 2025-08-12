import { Controller, Post, UseInterceptors, Param, UseGuards } from "@nestjs/common"
import { FileInterceptor } from "@nestjs/platform-express"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger"
import type { AttachmentsService } from "./attachments.service"
import type { Express } from "express"

@ApiTags("Attachments")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("attachments")
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}

  @ApiOperation({ summary: "Upload attachment for request" })
  @ApiResponse({ status: 201, description: "Attachment uploaded successfully" })
  @ApiConsumes("multipart/form-data")
  @Post("upload/:requestId")
  @UseInterceptors(FileInterceptor("file"))
  uploadFile(file: Express.Multer.File, @Param('requestId') requestId: string) {
    return this.attachmentsService.uploadFile(file, requestId)
  }
}
