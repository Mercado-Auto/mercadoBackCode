import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { Repository } from "typeorm";
import { CreateSectionDto } from "./dto/create-section.dto";
import { UpdatePositionDto } from "./dto/update-position.dto";
import { UpdateSectionDto } from "./dto/update-section.dto";
import { Section } from "./entities/section.entity";

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private readonly repo: Repository<Section>
  ) {}
  async create(createSectionDto: CreateSectionDto) {
    return await this.repo.save({ ...createSectionDto });
  }

  async findAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<Section>(
      await this.repo.findAndCount({
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          position: "ASC",
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
  ): Promise<Section[]> {
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

  async publicFindAllSections(): Promise<Section[]> {
    return await this.repo.find({
      relations: ["products", "products.reseller"],
      order: {
        position: "ASC",
      },
    });
  }

  async changeIndex({
    to_section_id,
    section_id,
  }: UpdatePositionDto): Promise<void> {
    const s = await this.findOne(section_id);

    const _to_section_id = await this.findOne(to_section_id)

    const index = _to_section_id.position;
    
    _to_section_id.position = s.position;

    s.position = index;

    await this.save(s);
    await this.save(_to_section_id);
  }

  async save(data: Section): Promise<void> {
    await this.repo.save(data);
  }

  async findOne(id: string) {
    try {
      return await this.repo.findOneOrFail({ where: { id } });
    } catch (error) {
      throw new NotFoundException("Seção não encontrada!");
    }
  }

  async update(id: string, updateSectionDto: UpdateSectionDto) {
    const section = await this.findOne(id);
    this.repo.merge(section, updateSectionDto);
    return await this.repo.save(section);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
