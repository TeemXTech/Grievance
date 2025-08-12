import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { ConfigModule } from "@nestjs/config"
import { BullModule } from "@nestjs/bull"
import { ScheduleModule } from "@nestjs/schedule"

import { DatabaseConfig } from "./config/database.config"
import { AuthModule } from "./modules/auth/auth.module"
import { UsersModule } from "./modules/users/users.module"
import { RequestsModule } from "./modules/requests/requests.module"
import { CategoriesModule } from "./modules/categories/categories.module"
import { FundsModule } from "./modules/funds/funds.module"
import { WhatsappModule } from "./modules/whatsapp/whatsapp.module"
import { AiAssistantModule } from "./modules/ai-assistant/ai-assistant.module"
import { DashboardModule } from "./modules/dashboard/dashboard.module"
import { AttachmentsModule } from "./modules/attachments/attachments.module"
import { AuditModule } from "./modules/audit/audit.module"
import { NotificationsModule } from "./modules/notifications/notifications.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    BullModule.forRoot({
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: Number.parseInt(process.env.REDIS_PORT) || 6379,
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    RequestsModule,
    CategoriesModule,
    FundsModule,
    WhatsappModule,
    AiAssistantModule,
    DashboardModule,
    AttachmentsModule,
    AuditModule,
    NotificationsModule,
  ],
})
export class AppModule {}
