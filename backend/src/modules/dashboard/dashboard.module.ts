import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { DashboardController } from "./dashboard.controller"
import { DashboardService } from "./dashboard.service"
import { Request } from "../../entities/request.entity"
import { User } from "../../entities/user.entity"
import { Category } from "../../entities/category.entity"
import { FundRequest } from "../../entities/fund-request.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Request, User, Category, FundRequest])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
