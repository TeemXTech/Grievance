import { Injectable, NotFoundException } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Request, RequestStatus } from "../../entities/request.entity"
import type { User } from "../../entities/user.entity"
import type { Category } from "../../entities/category.entity"
import type { CreateRequestDto } from "./dto/create-request.dto"
import type { UpdateRequestDto } from "./dto/update-request.dto"
import type { AssignRequestDto } from "./dto/assign-request.dto"
import type { RequestsFilterDto } from "./dto/requests-filter.dto"
import type { AuditService } from "../audit/audit.service"

@Injectable()
export class RequestsService {
  constructor(
    private requestRepository: Repository<Request>,
    private userRepository: Repository<User>,
    private categoryRepository: Repository<Category>,
    private auditService: AuditService,
  ) {}

  async create(createRequestDto: CreateRequestDto) {
    const request = this.requestRepository.create(createRequestDto)

    if (createRequestDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createRequestDto.categoryId },
      })
      request.category = category
    }

    const savedRequest = await this.requestRepository.save(request)

    // Log audit
    await this.auditService.log({
      action: "CREATE",
      entityType: "Request",
      entityId: savedRequest.id,
      newValues: savedRequest,
    })

    return savedRequest
  }

  async findAll(filters: RequestsFilterDto) {
    const query = this.requestRepository
      .createQueryBuilder("request")
      .leftJoinAndSelect("request.category", "category")
      .leftJoinAndSelect("request.assigned_to", "assigned_to")
      .leftJoinAndSelect("request.created_by_user", "created_by_user")

    if (filters.status) {
      query.andWhere("request.status = :status", { status: filters.status })
    }

    if (filters.type) {
      query.andWhere("request.type = :type", { type: filters.type })
    }

    if (filters.priority) {
      query.andWhere("request.priority = :priority", { priority: filters.priority })
    }

    if (filters.assignedTo) {
      query.andWhere("request.assigned_to = :assignedTo", { assignedTo: filters.assignedTo })
    }

    if (filters.categoryId) {
      query.andWhere("request.category = :categoryId", { categoryId: filters.categoryId })
    }

    const page = filters.page || 1
    const limit = filters.limit || 10
    const skip = (page - 1) * limit

    query.skip(skip).take(limit)
    query.orderBy("request.created_at", "DESC")

    const [requests, total] = await query.getManyAndCount()

    return {
      data: requests,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async findOne(id: string) {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ["category", "assigned_to", "created_by_user", "attachments", "fund_requests"],
    })

    if (!request) {
      throw new NotFoundException(`Request with ID ${id} not found`)
    }

    return request
  }

  async update(id: string, updateRequestDto: UpdateRequestDto) {
    const request = await this.findOne(id)
    const oldValues = { ...request }

    Object.assign(request, updateRequestDto)

    if (updateRequestDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateRequestDto.categoryId },
      })
      request.category = category
    }

    const updatedRequest = await this.requestRepository.save(request)

    // Log audit
    await this.auditService.log({
      action: "UPDATE",
      entityType: "Request",
      entityId: id,
      oldValues,
      newValues: updatedRequest,
    })

    return updatedRequest
  }

  async assign(id: string, assignRequestDto: AssignRequestDto) {
    const request = await this.findOne(id)
    const assignee = await this.userRepository.findOne({
      where: { id: assignRequestDto.assigneeId },
    })

    if (!assignee) {
      throw new NotFoundException(`User with ID ${assignRequestDto.assigneeId} not found`)
    }

    const oldValues = { ...request }
    request.assigned_to = assignee
    request.status = RequestStatus.ASSIGNED

    const updatedRequest = await this.requestRepository.save(request)

    // Log audit
    await this.auditService.log({
      action: "ASSIGN",
      entityType: "Request",
      entityId: id,
      oldValues,
      newValues: updatedRequest,
    })

    return updatedRequest
  }

  async remove(id: string) {
    const request = await this.findOne(id)
    await this.requestRepository.remove(request)

    // Log audit
    await this.auditService.log({
      action: "DELETE",
      entityType: "Request",
      entityId: id,
      oldValues: request,
    })

    return { message: "Request deleted successfully" }
  }
}
