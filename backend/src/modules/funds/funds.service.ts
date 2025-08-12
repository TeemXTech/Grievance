import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type FundRequest, ApprovalStatus } from "../../entities/fund-request.entity"
import type { Request } from "../../entities/request.entity"
import type { CreateFundRequestDto } from "./dto/create-fund-request.dto"

@Injectable()
export class FundsService {
  constructor(
    private fundRequestRepository: Repository<FundRequest>,
    private requestRepository: Repository<Request>,
  ) {}

  async create(createFundRequestDto: CreateFundRequestDto) {
    const request = await this.requestRepository.findOne({
      where: { id: createFundRequestDto.requestId },
    })

    if (!request) {
      throw new NotFoundException(`Request with ID ${createFundRequestDto.requestId} not found`)
    }

    const fundRequest = this.fundRequestRepository.create({
      ...createFundRequestDto,
      request,
      requested_date: new Date(),
    })

    return this.fundRequestRepository.save(fundRequest)
  }

  async findAll() {
    return this.fundRequestRepository.find({
      relations: ["request", "approver"],
      order: { created_at: "DESC" },
    })
  }

  async approve(id: number) {
    const fundRequest = await this.fundRequestRepository.findOne({
      where: { id },
    })

    if (!fundRequest) {
      throw new NotFoundException(`Fund request with ID ${id} not found`)
    }

    fundRequest.approval_status = ApprovalStatus.SANCTIONED
    return this.fundRequestRepository.save(fundRequest)
  }
}
