import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { FileS3Service } from "../../utils/FileS3Service";
import {resolvePaginationAndSorteringAndFiltering} from "../../utils/pagination";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/roles.decorator";
import { UserType } from "../users/entities/user.entity";
import { UpdateSaleDto } from "./dto/update-sale.dto";
import { SaleStatus } from "./entities/sale.entity";
import {filterRules} from "./filters";
import { SalesService } from "./sales.service";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(UserType.RESELLER, UserType.USER)
@ApiBearerAuth()
@ApiTags("Sales")
@Controller("sales")
export class SalesController {
  constructor(
    private readonly salesService: SalesService,
    private readonly configService: ConfigService,
    private readonly fileService: FileS3Service
  ) {}

  @Get("")
  findSales(@Request() req, @Query() query:any) {
    const myUserId = req.user.id;
    return this.salesService.findAllByResellerWithFilters(myUserId, resolvePaginationAndSorteringAndFiltering(query, filterRules));
  }

  @Get("/:id")
  findOneSales(@Request() req, @Param("id") id: string) {
    const myUserId = req.user.id;

    return this.salesService.findOneByReseller(myUserId, id);
  }

  @Patch("/:id")
  addTrackerCode(
    @Request() req,
    @Param("id") id: string,
    @Body() data: UpdateSaleDto
  ) {
    const myUserId = req.user.id;

    data.status = SaleStatus.DELIVERY_TRANSIT;

    return this.salesService.update(id, myUserId, data);
  }

  @Post("/:id/attach-nf")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async attachNf(
    @Param("id") id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    const myUserId = req.user.id;

    const img = await this.fileService.uploadFile(
      file.buffer,
      `${new Date().getTime()}-${file.originalname}`,
      this.configService.get("BUCKET_NFE")
    );

    await this.salesService.update(id, myUserId, {
      nf_link: img.Location,
    });
  }

  @Delete("/:id/detach-nf")
  async detachNf(@Request() req, @Param("id") id: string) {
    const myUserId = req.user.id;

    const sale = await this.salesService.findOneByReseller(myUserId, id);

    await this.fileService.deleteFile(
      sale.nf_link,
      this.configService.get("BUCKET_NFE")
    );

    await this.salesService.update(id, myUserId, {
      nf_link: "",
    });
  }
}
