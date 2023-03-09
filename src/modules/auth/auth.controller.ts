import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Request,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { LocalAuthGuard } from "./guards/local-auth.guard";
import { LoginDto } from "./dto/login.dto";
import { ResellersService } from "../resellers/resellers.service";
import { CreateResellerDto } from "../resellers/dto/create-reseller.dto";
import { UsersService } from "../users/users.service";
import { UserType } from "../users/entities/user.entity";
import { TokensService } from "../tokens/tokens.service";
import { changePasswordDto } from "./dto/change-password.dto";
import { ForgetPasswordDto } from "./dto/forget-password.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly resellersService: ResellersService,
    private readonly usersService: UsersService,
    private readonly tokenService: TokensService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Request() req, @Body() _: LoginDto) {
    return this.authService.signUser(req.user);
  }

  @Get("profile")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async getProfile(@Request() req) {
    const retval = {
      ...req.user,
    };
    const user = await this.usersService.findById(retval.id);

    if (retval.access_type === UserType.RESELLER) {
      retval["reseller"] = {
        ...user.reseller,
      };
    }
    retval.name = user.name;
    retval.email = user.email;

    return retval;
  }

  @Post("forget-password")
  async forgetPassword(@Param("email") data: ForgetPasswordDto) {
    await this.usersService.forgetPassword(data.email);
  }

  @Post("change-password/:token")
  async changePassword(
    @Param("token") token: string,
    @Body() data: changePasswordDto
  ) {
    await this.usersService.changePassword(token, data.password);
  }

  @Post("register")
  async registerReseller(@Body() reseller: CreateResellerDto) {
    await this.resellersService.create(reseller);
  }

  @Post("/confirm-email/:token")
  async confirmMail(@Param("token") token: string) {
    await this.usersService.confirmEmail(token);
  }

  @Post("send-email-confirmation")
  async sendConfirmMail(@Param("mail") email: string) {
    await this.usersService.sendConfirmEmail(email);
  }
}
