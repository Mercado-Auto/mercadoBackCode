import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { join } from "path";
import { DatabaseModule } from "src/database";
import { MailModule } from "src/mail/mail.module";
import { AuthModule } from "../auth/auth.module";
import { ResellersModule } from "../resellers/resellers.module";
import { UsersModule } from "../users/users.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ProductsModule } from "src/modules/products/products.module";
import { SectionsModule } from "../sections/sections.module";
import { TagsModule } from "../tags/tags.module";
import { CitiesModule } from "../cities/cities.module";
import { AccountsModule } from "./accounts/accounts.module";
import { SalesModule } from "./sales/sales.module";
import { AddressesModule } from "./addresses/addresses.module";
import { PaymentsModule } from "../payments/payments.module";
import { DayjsDateProvider } from "../../utils/date";
import { TokensModule } from "../tokens/tokens.module";
import { ScheduleModule } from "@nestjs/schedule";
import * as AWS from "aws-sdk";
import { ReportsModule } from "../reports/reports.module";

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      serveRoot: "/public",
      rootPath: join(__dirname, "..", "..", "..", "public"),
    }),
    PaymentsModule,
    ReportsModule,
    DatabaseModule,
    MailModule,
    AuthModule,
    CitiesModule,
    ResellersModule,
    UsersModule,
    ProductsModule,
    SectionsModule,
    TagsModule,
    AccountsModule,
    SalesModule,
    AddressesModule,
    TokensModule,
  ],
  controllers: [AppController],
  providers: [AppService, DayjsDateProvider],
})
export class AppModule {}
