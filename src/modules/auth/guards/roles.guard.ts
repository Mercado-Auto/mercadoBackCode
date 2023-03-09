import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserType } from "src/modules/users/entities/user.entity";
import { ROLES_KEY } from "../roles.decorator";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserType[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    const retval = requiredRoles.includes(user.access_type);

    if (!retval)
      throw new UnauthorizedException(
        "este usuario não tem permissoes para acessar essa rota"
      );

    return retval;
  }
}
