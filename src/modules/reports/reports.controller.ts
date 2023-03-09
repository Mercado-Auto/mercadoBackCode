import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserType } from "../users/entities/user.entity";
import { FilterReport } from "./dto/filter-report.dto";
import { ReportsService } from "./reports.service";
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags("Reports")
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @UseGuards(RolesGuard)
  @Roles(UserType.RESELLER)
  @Get("reseller")
  getDashReseller(@Req() req, @Query() filters: FilterReport) {
    const myUserId = req.user.id
    return this.reportsService.generateResellerDashboard(myUserId, filters);
  }

  @UseGuards(RolesGuard)
  @Roles(UserType.SYSADMIN,UserType.ADMIN)
  @Get("admin")
  getDashAdmin(@Query() filters: FilterReport) {
    return this.reportsService.generateAdminDashboard(filters);
  }
}
