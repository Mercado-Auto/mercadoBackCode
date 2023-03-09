import { Injectable, NotFoundException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { Repository } from "typeorm";
import { CreateCityDto } from "./dto/create-city.dto";
import { UpdateCityDto } from "./dto/update-city.dto";
import { City } from "./entities/city.entity";
import { ViaCEPCity } from "./dto/get-city-viacep.dto";
import { FindOrCreateDto } from "./dto/find-or-create.dto";

@Injectable()
export class CitiesService {
  constructor(
    @InjectRepository(City)
    private readonly repo: Repository<City>,

    private readonly httpService: HttpService
  ) {}

  async create(createCityDto: CreateCityDto): Promise<City> {
    return await this.repo.save({
      ...createCityDto,
    });
  }

  async findAll(pagination: PaginationAndSorteringAndFilteringDto) {
    return formatResponseWithPagination<City>(
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
  ): Promise<City[]> {
    return await this.repo.find({
      select: ["id", "name", "uf"],
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

  async findOne(id: string): Promise<City> {
    try {
      return await this.repo.findOneOrFail({
        where: { id },
      });
    } catch (error) {
      throw new NotFoundException("Cidade não encontrada!");
    }
  }

  async update(id: string, updateCityDto: UpdateCityDto): Promise<City> {
    const city = await this.findOne(id);
    this.repo.merge(city, updateCityDto);
    return await this.repo.save(city);
  }

  async findOrCreate(cep: string): Promise<FindOrCreateDto> {
    let city: City;
    try {
      const cityViaCep = await this.httpService.axiosRef.get<ViaCEPCity>(
        `https://viacep.com.br/ws/${cep}/json/`
      );

      city = await this.repo.findOne({
        where: {
          name: cityViaCep.data.localidade,
          uf: cityViaCep.data.uf,
        },
      });

      if (!city) {
        city = await this.create({
          name: cityViaCep.data.localidade,
          uf: cityViaCep.data.uf,
        });
      }

      return {
        ...cityViaCep.data,
        id: city.id,
      };
    } catch {
      throw new NotFoundException("cidade nao encontrada no via cep ");
    }

    // return await this.repo.save(city);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete({ id });
  }
}
