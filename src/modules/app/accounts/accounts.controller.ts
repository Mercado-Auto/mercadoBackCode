import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Get,
  Param,
  Req,
  Delete,
  Patch,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { AccountsService } from "./accounts.service";
import { CustomersService } from "src/modules/customers/customers.service";

import { LocalAuthGuard } from "./guards/local-auth.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

import { CreateCustomerDto } from "src/modules/customers/dto/create-customer.dto";
import { LoginDto } from "./dto/login.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { AddFavoriteDto } from "./dto/add-favorite.dto";
import { RemoveFavoriteDto } from "./dto/remove-favorite.dto";
import { UpdateCustomerDto } from "../../customers/dto/update-customer.dto";
import { ForgetPasswordDto } from "./dto/forget-password.dto";
import { SendConfirmationEmail } from "./dto/send-confirmation-email.dto";

@ApiTags("App")
@Controller("app/accounts")
export class AccountsController {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly customersService: CustomersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Request() req, @Body() _: LoginDto) {
    return this.accountsService.signCustomer(req.user);
  }

  @Get("profile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    return req.user;
  }

  @Patch("profile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  updateProfile(@Request() req, @Body() data: UpdateCustomerDto) {
    return this.customersService.update(req.user.id, data);
  }

  @Post("register")
  registerCustomer(@Body() customer: CreateCustomerDto) {
    return this.customersService.create(customer);
  }

  @Post("forget-password")
  forgetPassword(@Body() data: ForgetPasswordDto) {
    return this.customersService.forgetPassword(data.email);
  }

  @Post("change-password/:token")
  changePassword(
    @Param("token") token: string,
    @Body() data: ChangePasswordDto
  ) {
    return this.customersService.changePassword(token, data.password);
  }

  @Post("confirm-email/:token")
  confirmMail(@Param("token") token: string) {
    return this.customersService.confirmEmail(token);
  }

  @Post("send-email-confirmation")
  sendConfirmMail(@Body() data: SendConfirmationEmail) {
    return this.customersService.sendConfirmMail(data.email);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("favorites")
  findFavorites(@Request() req) {
    return this.customersService.findAllFavorites(req.user.id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("favorites")
  addFavorite(@Request() req, @Body() data: AddFavoriteDto) {
    return this.customersService.add(req.user.id, data.product_id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete("favorites")
  removeFavorite(@Request() req, @Body() data: RemoveFavoriteDto) {
    return this.customersService.removeFavorite(req.user.id, data.product_id);
  }
}
