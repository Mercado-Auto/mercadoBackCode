import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  Request,
  UseGuards,
  Query,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { UserType } from "./entities/user.entity";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { filterRules } from "./users.filters";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(UserType.SYSADMIN, UserType.RESELLER)
@ApiBearerAuth()
@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto, @Request() req) {
    const myUserId = req.user.id;
    return await this.usersService.create(createUserDto, myUserId);
  }

  @Get()
  async findAll(@Query() query, @Request() req) {
    const myUserId = req.user.id;

    return this.usersService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules),
      myUserId
    );
  }

  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req) {
    const myUserId = req.user.id;
    return await this.usersService.findOne(id, myUserId);
  }

  @Patch("change-user")
  async changeUser(
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const myUserId = req.user.id;
    return await this.usersService.changeUser(myUserId, updateUserDto);
  }

  @Patch(":id")
  async update(
    @Param("id") id: string,
    @Request() req,
    @Body() updateUserDto: UpdateUserDto
  ) {
    const myUserId = req.user.id;
    return await this.usersService.update(id, myUserId, updateUserDto);
  }

  @Delete(":id")
  @HttpCode(204)
  async remove(@Param("id") id: string, @Request() req) {
    const myUserId = req.user.id;
    await this.usersService.remove(id, myUserId);
  }
}
