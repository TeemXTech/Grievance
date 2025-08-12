import { Injectable } from "@nestjs/common"
import type { Repository } from "typeorm"
import { type Request, RequestStatus } from "../../entities/request.entity"
import type { User } from "../../entities/user.entity"
import type { Category } from "../../entities/category.entity"
import type { FundRequest } from "../../entities/fund-request.entity"

@Injectable()
export class DashboardService {
  constructor(
    private requestRepository: Repository<Request>,
    private userRepository: Repository<User>,
    private categoryRepository: Repository<Category>,
    private fundRequestRepository: Repository<FundRequest>,
  ) {}

  async getStats() {
    const totalRequests = await this.requestRepository.count()
    const pendingRequests = await this.requestRepository.count({
      where: { status: RequestStatus.PENDING },
    })
    const resolvedRequests = await this.requestRepository.count({
      where: { status: RequestStatus.RESOLVED },
    })

    // Calculate average resolution time (mock calculation)
    const avgResolutionTime = 3.2
    const monthlyGrowth = 12.5
    const satisfactionRate = 94.2

    return {
      totalRequests,
      pendingRequests,
      resolvedRequests,
      avgResolutionTime,
      monthlyGrowth,
      satisfactionRate,
    }
  }

  async getRecentRequests() {
    return this.requestRepository.find({
      take: 10,
      order: { created_at: "DESC" },
      relations: ["category", "assigned_to"],
    })
  }

  async getTrends() {
    // Mock trends data - in real implementation, this would query actual data
    return [
      { month: "Jan", requests: 120, resolved: 115 },
      { month: "Feb", requests: 135, resolved: 128 },
      { month: "Mar", requests: 148, resolved: 142 },
      { month: "Apr", requests: 162, resolved: 155 },
      { month: "May", requests: 178, resolved: 170 },
      { month: "Jun", requests: 195, resolved: 188 },
    ]
  }

  async getCategoryDistribution() {
    const categories = await this.categoryRepository.find()
    const distribution = []

    for (const category of categories) {
      const count = await this.requestRepository.count({
        where: { category: { id: category.id } },
      })

      distribution.push({
        name: category.name,
        count,
        value: Math.round((count / (await this.requestRepository.count())) * 100),
      })
    }

    return distribution
  }
}
