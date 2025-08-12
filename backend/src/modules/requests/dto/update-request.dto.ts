import { PartialType } from "@nestjs/swagger"
import { CreateRequestDto } from "./create-request.dto"
import { IsEnum, IsOptional } from "class-validator"
import { RequestStatus } from "../../../entities/request.entity"

export class UpdateRequestDto extends PartialType(CreateRequestDto) {
  @IsEnum(RequestStatus)
  @IsOptional()
  status?: RequestStatus
}
