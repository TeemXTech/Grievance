import { Controller, Get, UseGuards } from "@nestjs/common"
import { AuthGuard } from "@nestjs/passport"
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger"
import type { DashboardService } from "./dashboard.service"

@ApiTags("Dashboard")
@ApiBearerAuth()
@UseGuards(AuthGuard("jwt"))
@Controller("dashboard")
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({ summary: "Get dashboard statistics" })
  @ApiResponse({ status: 200, description: "Dashboard stats" })
  @Get("stats")
  getStats() {
    return this.dashboardService.getStats()
  }

  @ApiOperation({ summary: "Get recent requests" })
  @ApiResponse({ status: 200, description: "Recent requests" })
  @Get("recent-requests")
  getRecentRequests() {
    return this.dashboardService.getRecentRequests()
  }

  @ApiOperation({ summary: "Get trends data" })
  @ApiResponse({ status: 200, description: "Trends data" })
  @Get("trends")
  getTrends() {
    return this.dashboardService.getTrends()
  }

  @ApiOperation({ summary: "Get category distribution" })
  @ApiResponse({ status: 200, description: "Category distribution" })
  @Get("category-distribution")
  getCategoryDistribution() {
    return this.dashboardService.getCategoryDistribution()
  }
}
