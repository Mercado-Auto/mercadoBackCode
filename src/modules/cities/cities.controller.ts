import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from "@nestjs/common";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { CitiesService } from "./cities.service";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { filterRules } from "./cities.filters";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserType } from "../users/entities/user.entity";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(UserType.SYSADMIN, UserType.ADMIN)
@ApiBearerAuth()
@ApiTags("Cities")
@Controller("cities")
export class CitiesController {
  constructor(private readonly citiesService: CitiesService) {}

  @Post()
  create(@Body() createCityDto: CreateCityDto) {
    return this.citiesService.create(createCityDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.citiesService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.citiesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateCityDto: UpdateCityDto) {
    return this.citiesService.update(id, updateCityDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.citiesService.remove(id);
  }
}
