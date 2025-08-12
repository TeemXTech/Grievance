import { Controller, Get, Post, Patch, Param, Delete, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { RequestsService } from "./requests.service"
import type { CreateRequestDto } from "./dto/create-request.dto"
import type { UpdateRequestDto } from "./dto/update-request.dto"
import type { AssignRequestDto } from "./dto/assign-request.dto"
import type { RequestsFilterDto } from "./dto/requests-filter.dto"

@ApiTags("Requests")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("requests")
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @ApiOperation({ summary: "Create a new request" })
  @ApiResponse({ status: 201, description: "Request created successfully" })
  @Post()
  create(createRequestDto: CreateRequestDto) {
    return this.requestsService.create(createRequestDto)
  }

  @ApiOperation({ summary: "Get all requests with filters" })
  @ApiResponse({ status: 200, description: "List of requests" })
  @Get()
  findAll(filters: RequestsFilterDto) {
    return this.requestsService.findAll(filters)
  }

  @ApiOperation({ summary: 'Get request by ID' })
  @ApiResponse({ status: 200, description: 'Request details' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.requestsService.findOne(id);
  }

  @ApiOperation({ summary: "Update request" })
  @ApiResponse({ status: 200, description: "Request updated successfully" })
  @Patch(":id")
  update(@Param('id') id: string, updateRequestDto: UpdateRequestDto) {
    return this.requestsService.update(id, updateRequestDto)
  }

  @ApiOperation({ summary: "Assign request to user" })
  @ApiResponse({ status: 200, description: "Request assigned successfully" })
  @Post(":id/assign")
  assign(@Param('id') id: string, assignRequestDto: AssignRequestDto) {
    return this.requestsService.assign(id, assignRequestDto)
  }

  @ApiOperation({ summary: 'Delete request' })
  @ApiResponse({ status: 200, description: 'Request deleted successfully' })
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.requestsService.remove(id);
  }
}
