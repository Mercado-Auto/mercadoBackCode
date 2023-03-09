import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  UseGuards,
  Query,
  UseInterceptors,
  UploadedFile,
  NotFoundException,
} from "@nestjs/common";
import { ProductsService } from "./products.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/modules/auth/guards/jwt-auth.guard";
import { RolesGuard } from "src/modules/auth/guards/roles.guard";
import { Roles } from "src/modules/auth/roles.decorator";
import { UserType } from "src/modules/users/entities/user.entity";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { filterRules } from "./products.filters";

import { AddProductStockDto } from "./dto/add-product-stock.dto";
import { RemoveProductStockDto } from "./dto/remove-product-stock.dto";
import { FileS3Service } from "../../utils/FileS3Service";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";

@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
@Roles(UserType.RESELLER)
@ApiBearerAuth()
@ApiTags("Products")
@Controller("products")
export class ProductsController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly fileService: FileS3Service,
    private readonly configService: ConfigService
  ) { }

  @Post()
  create(@Body() createProductDto: CreateProductDto, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.create(createProductDto, myUserId);
  }

  @Patch("stock")
  addProduct(@Body() addProductDto: AddProductStockDto, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.addProduct(addProductDto, myUserId);
  }

  @Delete("stock/:product_id/:quantity")
  removeProduct(@Param() addProductDto: RemoveProductStockDto, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.removeProduct(addProductDto, myUserId);
  }

  @Get()
  findAll(@Query() query, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.findAll(
      resolvePaginationAndSorteringAndFiltering(query, filterRules),
      myUserId
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.findOne(id, myUserId);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Request() req,
    @Body() updateProductDto: UpdateProductDto
  ) {
    const myUserId = req.user.id;
    return this.productsService.update(id, myUserId, updateProductDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string, @Request() req) {
    const myUserId = req.user.id;
    return this.productsService.remove(id, myUserId);
  }

  @Post(":id/photo")
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
  async uploadPhotos(
    @Param("id") id: string,
    @Request() req,
    @UploadedFile() file: Express.Multer.File
  ) {
    const myUserId = req.user.id;
    const product = await this.productsService.findOne(id, myUserId);

    const img = await this.fileService.uploadFile(
      file.buffer,
      `${new Date().getTime()}-${file.originalname}`,
      this.configService.get("BUCKET_IMGS")
    );

    const retval = this.productsService.update(id, myUserId, {
      photos: [...product.photos, img.Location],
    });

    return {
      ...retval,
      status: "success",
    };
  }

  @Delete(":id/photo/:index")
  async deletePhoto(
    @Param("id") id: string,
    @Param("index") photoIndex: string,
    @Request() req
  ) {
    const myUserId = req.user.id;
    const product = await this.productsService.findOne(id, myUserId);
    const filePath = product.photos[photoIndex];
    if (filePath) {
      const photos = product.photos.filter((_, idx) => idx !== +photoIndex);
      await this.fileService.deleteFile(
        filePath,
        this.configService.get("BUCKET_IMGS")
      );
      return this.productsService.update(id, myUserId, {
        photos,
      });
    }

    throw new NotFoundException("Foto não existente!");
  }
}
