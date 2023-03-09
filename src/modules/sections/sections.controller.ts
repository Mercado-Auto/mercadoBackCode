import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from "@nestjs/common";
import { SectionsService } from "./sections.service";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { filterRules } from "./sections.filters";
import { UpdatePositionDto } from "./dto/update-position.dto";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags("Sections")
@Controller("sections")
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post()
  create(@Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(createSectionDto);
  }

  @Get()
  findAll(@Query() query) {
    return this.sectionsService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules)
    );
  }

  @Patch("position")
  ChangePosition(@Body() data: UpdatePositionDto) {
    return this.sectionsService.changeIndex(data);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.sectionsService.remove(id);
  }
}
