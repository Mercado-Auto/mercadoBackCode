import { Injectable } from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Search} from "./entities/search.entity";

  
  @Injectable()
  export class SearchService {

    constructor(
    @InjectRepository(Search)
     private readonly repo: Repository<Search>,
    ){}

   async saveSearch(description:string) {
   await this.repo.save({
        description
    })
   }
  }

  