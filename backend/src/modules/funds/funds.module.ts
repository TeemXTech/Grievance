import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { FundsController } from "./funds.controller"
import { FundsService } from "./funds.service"
import { FundRequest } from "../../entities/fund-request.entity"
import { Request } from "../../entities/request.entity"
import { User } from "../../entities/user.entity"

@Module({
  imports: [TypeOrmModule.forFeature([FundRequest, Request, User])],
  controllers: [FundsController],
  providers: [FundsService],
})
export class FundsModule {}
