import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RequestsController } from "./requests.controller"
import { RequestsService } from "./requests.service"
import { Request } from "../../entities/request.entity"
import { User } from "../../entities/user.entity"
import { Category } from "../../entities/category.entity"
import { AuditModule } from "../audit/audit.module"

@Module({
  imports: [TypeOrmModule.forFeature([Request, User, Category]), AuditModule],
  controllers: [RequestsController],
  providers: [RequestsService],
  exports: [RequestsService],
})
export class RequestsModule {}
