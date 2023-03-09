import { Controller, Get, Query } from "@nestjs/common";
import {
  FilterCityDto,
  FilterProductDto,
  FilterSectionDto,
  FilterTagDto,
  findOrCreateCityDto,
} from "./app.dto";
import { ApiTags } from "@nestjs/swagger";

import { CitiesService } from "../cities/cities.service";
import { SectionsService } from "../sections/sections.service";
import { TagsService } from "../tags/tags.service";

import { filterRules as filterCityRules } from "../cities/cities.filters";
import { filterRules as filterSectionRules } from "../sections/sections.filters";
import { filterRules as filterTagRules } from "../tags/tags.filters";
import { filterRules as filterProductRules } from "../products/products.filters";
import { ProductsService } from "../products/products.service";
import { resolvePaginationAndSorteringAndFiltering } from "src/utils/pagination";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import {SearchService} from "../products/search.service";

@ApiTags("App")
@Controller("app")
export class AppController {
  constructor(
    private readonly citiesService: CitiesService,
    private readonly sectionsService: SectionsService,
    private readonly tagsService: TagsService,
    private readonly productsService: ProductsService,
    private readonly searchService:SearchService
  ) {}

  @Get("city")
  async findCities(@Query() query: FilterCityDto) {
    return await this.citiesService.findAllCombo({
      pageSize: 30,
      order_by: "name",
      sort_by: "ascend",
      page: 1,
      filters: {
        ...(query["name"] !== undefined
          ? { name: filterCityRules["name"](query["name"]) }
          : {}),
        ...(query["uf"] !== undefined
          ? { uf: filterCityRules["uf"](query["uf"]) }
          : {}),
      },
    });
  }

  @Get("city/find")
  async findOrCreate(@Query() data: findOrCreateCityDto) {
    return await this.citiesService.findOrCreate(data.cep);
  }

  @Get("section")
  async findSections(@Query() query: FilterSectionDto) {
    return await this.sectionsService.findAllCombo({
      pageSize: 30,
      order_by: "name",
      sort_by: "ascend",
      page: 1,
      filters: {
        ...(query["name"] !== undefined
          ? { name: filterSectionRules["name"](query["name"]) }
          : {}),
      },
    });
  }

  @Get("tag")
  async findTags(@Query() query: FilterTagDto) {
    return await this.tagsService.findAllCombo({
      pageSize: 30,
      order_by: "name",
      sort_by: "ascend",
      page: 1,
      filters: {
        ...(query["name"] !== undefined
          ? { name: filterTagRules["name"](query["name"]) }
          : {}),
      },
    });
  }

  @Get("product")
  async findProducts(@Query() query: FilterProductDto) {
    const queryOptions = resolvePaginationAndSorteringAndFiltering(
      query as PaginationAndSorteringAndFilteringDto,
      filterProductRules
    );
    if(query.name) {
      await this.searchService.saveSearch(query.name)
    }

    return await this.productsService.publicFindAll({
      ...queryOptions,
      filters: {
        ...(query["name"] !== undefined
          ? { name: filterProductRules["name"](query["name"]) }
          : {}),
        ...(query["sections"] !== undefined
          ? { sections: filterProductRules["sections"](query["sections"]) }
          : {}),
        ...(query["tags"] !== undefined
          ? { tags: filterProductRules["tags"](query["tags"]) }
          : {}),
        ...(query["price"] !== undefined
          ? filterProductRules["price"](query["price"])
          : {}),
      },
    });
  }

  @Get("products/home")
  async findSectionsHome() {
    const sections = await this.sectionsService.publicFindAllSections();

    const sectionsWithFiveProducts = sections.map((section) => {
      return section.products.length > 5
        ? section.products.splice(4, section.products.length)
        : section;
    });

    return sectionsWithFiveProducts;
  }
}
