import { Module } from "@nestjs/common";
import { ProductsService } from "./products.service";
import { ProductsController } from "./products.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Product } from "./entities/product.entity";
import { UsersModule } from "src/modules/users/users.module";
import { SectionsModule } from "../sections/sections.module";
import { TagsModule } from "../tags/tags.module";
import { FileS3Service } from "../../utils/FileS3Service";
import {Search} from "./entities/search.entity";
import {SearchService} from "./search.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Search]),
    UsersModule,
    SectionsModule,
    TagsModule,
  ],
  controllers: [ProductsController],
  providers: [ProductsService, FileS3Service, SearchService],
  exports: [ProductsService,SearchService],
})
export class ProductsModule {}
