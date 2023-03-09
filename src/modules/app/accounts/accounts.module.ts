import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";

import { PassportModule } from "@nestjs/passport";
import { CustomersModule } from "src/modules/customers/customers.module";
import { TokensModule } from "../../tokens/tokens.module";

import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { jwtConstants } from "./constants";
import { JwtStrategy } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

@Module({
  imports: [
    PassportModule,
    CustomersModule,
    TokensModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "3h" },
    }),
  ],
  controllers: [AccountsController],
  providers: [AccountsService, LocalStrategy, JwtStrategy],
  exports: [AccountsService],
})
export class AccountsModule {}
