import { Strategy } from "passport-local";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AccountsService } from "../accounts.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(
  Strategy,
  "customer_local"
) {
  constructor(private accountsService: AccountsService) {
    super({
      usernameField: "email",
      passwordField: "password",
    });
  }

  async validate(email: string, password: string): Promise<any> {
    const customer = await this.accountsService.validateCustomer(
      email,
      password
    );

    if (!customer) {
      throw new UnauthorizedException();
    }

    return customer;
  }
}
