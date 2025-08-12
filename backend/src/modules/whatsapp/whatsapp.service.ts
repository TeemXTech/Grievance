import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type WhatsappMessage, ParsedStatus } from "../../entities/whatsapp-message.entity"

@Injectable()
export class WhatsappService {
  constructor(private whatsappMessageRepository: Repository<WhatsappMessage>) {}

  async getPendingMessages() {
    return this.whatsappMessageRepository.find({
      where: { parsed_status: ParsedStatus.PENDING },
      order: { received_at: "DESC" },
    })
  }

  async approveMessage(id: number) {
    const message = await this.whatsappMessageRepository.findOne({
      where: { id },
    })

    if (!message) {
      throw new NotFoundException(`WhatsApp message with ID ${id} not found`)
    }

    message.parsed_status = ParsedStatus.APPROVED
    return this.whatsappMessageRepository.save(message)
  }
}
