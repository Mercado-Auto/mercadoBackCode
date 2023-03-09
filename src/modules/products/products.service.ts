import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserType } from "src/modules/users/entities/user.entity";
import { UsersService } from "src/modules/users/users.service";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { Repository } from "typeorm";
import { SectionsService } from "../sections/sections.service";
import { TagsService } from "../tags/tags.service";
import { AddProductStockDto } from "./dto/add-product-stock.dto";
import { CreateProductDto } from "./dto/create-product.dto";
import { RemoveProductStockDto } from "./dto/remove-product-stock.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { Product } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repo: Repository<Product>,
    private readonly usersService: UsersService,
    private readonly sectionsService: SectionsService,
    private readonly tagsService: TagsService
  ) { }

  async create(
    createProductDto: CreateProductDto,
    currentUserId: string
  ): Promise<Product> {
    const { sections: sectionsIds, tags: tagsIds, ...data } = createProductDto;
    const myUser = await this.usersService.findById(currentUserId);
    if (myUser.access_type !== UserType.RESELLER)
      throw new BadRequestException(
        "Somente usuários do tipo revendedor podem cadastrar produtos!"
      );

    const sections = await Promise.all(
      sectionsIds.map(async (id) => await this.sectionsService.findOne(id))
    );

    const tags = await Promise.all(
      tagsIds.map(async (id) => await this.tagsService.findOne(id))
    );

    return await this.repo.save({
      ...data,
      reseller: myUser.reseller,
      sections: sections || [],
      tags: tags || [],
    });
  }

  async findAll(
    pagination: PaginationAndSorteringAndFilteringDto,
    currentUserId: string
  ) {
    const myUser = await this.usersService.findById(currentUserId);

    return formatResponseWithPagination<Product>(
      await this.repo.findAndCount({
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        where: {
          ...pagination.filters,
          reseller: {
            id: myUser.reseller.id,
          },
        },
        relations: {
          sections: true,
          tags: true,
        },
      })
    );
  }

  async findOne(id: string, currentUserId: string) {
    const myUser = await this.usersService.findById(currentUserId);
    try {
      const product = await this.repo.findOneOrFail({
        where: {
          id,
          reseller: {
            id: myUser.reseller.id,
          },
        },
        relations: {
          sections: true,
          tags: true,
        },
      });

      return product;
    } catch (error) {
      throw new NotFoundException("Produto não encontrado!");
    }
  }

  async addProduct(addProductDto: AddProductStockDto, currentUserId: string) {
    const user = await this.usersService.findById(currentUserId);
    if (user.access_type !== UserType.RESELLER)
      throw new BadRequestException(
        "Somente usuários do tipo revendedor podem adicionar produtos no estoque!"
      );
    const product = await this.findOne(addProductDto.product_id, currentUserId);

    product.stock_quantity =
      Number(product.stock_quantity) + Number(addProductDto.quantity);

    this.repo.save(product);
  }

  async removeProduct(
    removeProductDto: RemoveProductStockDto,
    currentUserId: string
  ) {
    const user = await this.usersService.findById(currentUserId);
    if (user.access_type !== UserType.RESELLER){
      throw new BadRequestException(
        "Somente usuários do tipo revendedor podem adicionar produtos no estoque!"
      );
    }
      
    const product = await this.findOne(removeProductDto.product_id, currentUserId);
    
    if (Number(removeProductDto.quantity) > Number(product.stock_quantity)){
      throw new BadRequestException(
        "Voce não tem essa quantidade de produto para remover!"
      );
    }

    product.stock_quantity =  Number(product.stock_quantity) - Number(removeProductDto.quantity)
      

    this.repo.save(product);
  }

  async findById(id: string) {
    try {
      const product = await this.repo.findOneOrFail({
        where: {
          id,
        },
        relations: {
          sections: true,
          tags: true,
          reseller: true,
        },
      });

      return product;
    } catch (error) {
      throw new NotFoundException("Produto não encontrado!");
    }
  }

  async update(
    id: string,
    currentUserId: string,
    updateProductDto: UpdateProductDto
  ) {
    const { sections: sectionsIds, tags: tagsIds, ...data } = updateProductDto;
    const product = await this.findOne(id, currentUserId);
    this.repo.merge(product, data);

    if (sectionsIds) {
      product.sections = await Promise.all(
        sectionsIds.map(async (id) => await this.sectionsService.findOne(id))
      );
    }

    if (tagsIds) {
      product.tags = await Promise.all(
        tagsIds.map(async (id) => await this.tagsService.findOne(id))
      );
    }

    await this.repo.save(product);

    return product;
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);
    await this.repo.delete({ id });
  }

  async publicFindAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<Product>(
      await this.repo.findAndCount({
        select: ["id", "name", "price", "stock_quantity", "photos"],
        relations: {
          sections: true,
          tags: true,
        },
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        where: {
          ...pagination.filters,
        },
      })
    );
  }
}
