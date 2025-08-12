import { Injectable, NotFoundException } from "@nestjs/common"
import { InjectRepository } from "@nestjs/typeorm"
import type { Repository } from "typeorm"
import { Attachment } from "../../entities/attachment.entity"
import { Request } from "../../entities/request.entity"
import type { Express } from "express"

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private attachmentRepository: Repository<Attachment>,
    @InjectRepository(Request)
    private requestRepository: Repository<Request>,
  ) {}

  async uploadFile(file: Express.Multer.File, requestId: string) {
    const request = await this.requestRepository.findOne({
      where: { id: requestId },
    })

    if (!request) {
      throw new NotFoundException(`Request with ID ${requestId} not found`)
    }

    const attachment = this.attachmentRepository.create({
      filename: file.filename,
      original_name: file.originalname,
      file_path: file.path,
      file_size: file.size,
      mime_type: file.mimetype,
      request,
    })

    return this.attachmentRepository.save(attachment)
  }
}
