import { Controller, Get, Post, Patch, Param, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { FundsService } from "./funds.service"
import type { CreateFundRequestDto } from "./dto/create-fund-request.dto"

@ApiTags("Fund Requests")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("funds")
export class FundsController {
  constructor(private readonly fundsService: FundsService) {}

  @ApiOperation({ summary: "Create a new fund request" })
  @ApiResponse({ status: 201, description: "Fund request created successfully" })
  @Post()
  create(createFundRequestDto: CreateFundRequestDto) {
    return this.fundsService.create(createFundRequestDto)
  }

  @ApiOperation({ summary: "Get all fund requests" })
  @ApiResponse({ status: 200, description: "List of fund requests" })
  @Get()
  findAll() {
    return this.fundsService.findAll()
  }

  @ApiOperation({ summary: 'Approve fund request' })
  @ApiResponse({ status: 200, description: 'Fund request approved' })
  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.fundsService.approve(+id);
  }
}
