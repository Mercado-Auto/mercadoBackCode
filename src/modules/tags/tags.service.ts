import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { Repository } from "typeorm";
import { CreateTagDto } from "./dto/create-tag.dto";
import { UpdateTagDto } from "./dto/update-tag.dto";
import { Tag } from "./entities/tag.entity";

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly repo: Repository<Tag>
  ) {}
  async create(createTagDto: CreateTagDto) {
    return await this.repo.save({ ...createTagDto });
  }

  async findAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<Tag>(
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
        },
      })
    );
  }

  async findAllCombo(
    pagination: PaginationAndSorteringAndFilteringDto
  ): Promise<Tag[]> {
    return await this.repo.find({
      select: ["id", "name"],
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
    });
  }

  async findOne(id: string) {
    try {
      return await this.repo.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException("Tag não encontrada!");
    }
  }

  async update(id: string, updateTagDto: UpdateTagDto) {
    const tag = await this.findOne(id);
    this.repo.merge(tag, updateTagDto);
    return await this.repo.save(tag);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
