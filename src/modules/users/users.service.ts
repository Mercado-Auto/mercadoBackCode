import {
  ConflictException,
  ForbiddenException,
  HttpException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { User, UserType } from "./entities/user.entity";
import { PaginationAndSorteringAndFilteringDto } from "src/utils/pagination.dto";
import { formatResponseWithPagination } from "src/utils/response";
import { MailService } from "src/mail/mail.service";
import { randomUUID } from "crypto";
import { TokensService } from "../tokens/tokens.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
    private readonly mailService: MailService,
    private readonly tokenService: TokensService
  ) {}

  async findById(id: string): Promise<User> {
    return await this.repo
      .findOneOrFail({
        where: {
          id,
        },
        relations: ["reseller"],
      })
      .catch((err) => {
        throw new NotFoundException("Usuario não encontrado!");
      });
  }

  async create(createUserDto: CreateUserDto, currentUserId: string) {
    const myUser = await this.findById(currentUserId);
    let newUser: User = null;

    await this.repo.manager.transaction(async (manager) => {
      if (myUser.access_type === UserType.RESELLER) {
        createUserDto.access_type = UserType.USER;
        createUserDto.reseller = myUser.reseller;
      } else if (myUser.access_type === UserType.SYSADMIN) {
        createUserDto.access_type = UserType.ADMIN;
      } else {
        throw new ForbiddenException(
          "Usuário sem acesso para criar outro usuário!"
        );
      }

      const existingEmail = await this.findByEmailWithPassword(
        createUserDto.email
      );
      if (existingEmail) throw new ConflictException("E-Mail já existe");

      createUserDto.password = bcrypt.hashSync(createUserDto.password, 10);

      newUser = await manager.getRepository(User).save({
        ...createUserDto,
      });

      // await this.mailService.sendConfirmation(newUser, randomUUID());
    });

    return await this.findOne(newUser.id, currentUserId);
  }

  async findAll(
    pagination: PaginationAndSorteringAndFilteringDto,
    currentUserId: string
  ) {
    const myUser = await this.findById(currentUserId);

    return formatResponseWithPagination<User>(
      await this.repo.findAndCount({
        take: pagination.pageSize,
        skip: (pagination.page - 1) * pagination.pageSize,
        order: {
          [pagination.order_by]: pagination.sort_by
            .toString()
            .replace("end", "")
            .toUpperCase(),
        },
        select: ["id", "name", "email", "access_type"],
        where: {
          ...pagination.filters,
          ...(myUser.access_type === UserType.RESELLER
            ? {
                access_type: UserType.USER,
                reseller: {
                  id: myUser.reseller.id,
                },
              }
            : {
                access_type: In([UserType.ADMIN, UserType.RESELLER]),
              }),
        },
      })
    );
  }

  async findOne(id: string, currentUserId: string): Promise<User> {
    const myUser = await this.findById(currentUserId);

    try {
      const user = await this.repo.findOneOrFail({
        where: {
          id,
          ...(myUser.access_type === UserType.RESELLER
            ? {
                access_type: UserType.USER,
                reseller: {
                  id: myUser.reseller.id,
                },
              }
            : {
                access_type: In([UserType.ADMIN, UserType.RESELLER]),
              }),
        },
        relations: ["reseller"],
      });

      delete user.password;

      return user;
    } catch (error) {
      throw new NotFoundException("Usuário não encontrado!");
    }
  }

  async findByEmailWithPassword(email: string): Promise<User> {
    return await this.repo.findOne({
      where: { email },
    });
  }

  async confirmEmail(token: string): Promise<boolean> {
    const _token = await this.tokenService.findById(token);

    if (!(await this.tokenService.isValid(token))) {
      throw new HttpException("Token expirado", 401);
    }

    const user = await this.findById(_token.user);

    if (_token) {
      this.repo.merge(user, {
        verified_email: true,
      });
      await this.repo.save(user);
      return true;
    }

    throw new NotFoundException("Token não encontrado!");
  }

  async sendConfirmEmail(email: string): Promise<void> {
    const user = await this.repo.findOne({
      where: { email },
    });

    if (user) {
      throw new NotFoundException("Usuario não encontrado com esse email!");
    }

    this.repo.merge(user, {
      verified_email: false,
    });
    await this.repo.save(user);

    const { token } = await this.tokenService.new(user);

    await this.mailService.sendConfirmation(user, token);
  }

  async forgetPassword(email: string): Promise<void> {
    const user = await this.repo.findOne({
      where: {
        email,
      },
    });

    if (!user) {
      throw new NotFoundException("Usuario não encontrado com esse email!");
    }

    const { token } = await this.tokenService.new(user);

    await this.mailService.forgetPassword(user, token);
  }

  async changePassword(token: string, newPassword: string): Promise<void> {
    const _token = await this.tokenService.findByToken(token);

    if (!_token) {
      throw new NotFoundException("Token não encontrado para esse email!");
    }

    if (!(await this.tokenService.isValid(token))) {
      throw new HttpException("Token expirado", 401);
    }
    const data = (await this.tokenService.decodeToken(token)) as User;

    const user = await this.findById(_token.user);

    if (data.email === user.email) {
      user.password = bcrypt.hashSync(newPassword, 10);

      await this.repo.save(user);

      await this.tokenService.destroy(_token.id);
      return;
    }

    throw new HttpException("user not found", 500);
  }

  async update(
    id: string,
    currentUserId: string,
    updateUserDto: UpdateUserDto
  ): Promise<User> {
    const user = await this.findOne(id, currentUserId);
    this.repo.merge(user, updateUserDto);
    await this.repo.save(user);

    delete user.password;
    return user;
  }

  async changeUser(
    currentUserId: string,
    updateUserDto: UpdateUserDto):Promise<User> {
    const user = await this.repo.findOne({
      where:{
          id:currentUserId
        },
        relations:['reseller']
    })

    if("password" in updateUserDto && updateUserDto.password) {
         user.password = bcrypt.hashSync(updateUserDto.password, 10)
    }
    if(user.access_type === UserType.RESELLER) {
      if("email" in updateUserDto && updateUserDto.email) {
        user.reseller.responsible_email = updateUserDto.email
      }
      if("name" in updateUserDto && updateUserDto.name) {
        user.reseller.responsible_name = updateUserDto.name
      }
    }
      
    delete updateUserDto.password;

    this.repo.merge(user, updateUserDto)

    await this.repo.save(user)

    delete user.password

    return user
    }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id, currentUserId);
    await this.repo.delete({ id });
  }
}
