import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";

import { Request, Response } from "express";

import {
  QueryFailedError,
  EntityNotFoundError,
  CannotCreateEntityIdMapError,
} from "typeorm";

import { GlobalResponseError } from "./global.response.error";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    let message = (exception as any).message.message;

    Logger.error(
      message,
      (exception as any).stack,
      `${request.method} ${request.url}`
    );

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    switch (exception.constructor) {
      case HttpException:
        status = (exception as HttpException).getStatus();
        if (((exception as HttpException).getResponse() as any).message) {
          message = (
            (exception as HttpException).getResponse() as any
          ).message.join(", ");
        } else {
          message = (exception as HttpException).message;
        }

        break;
      case QueryFailedError: // this is a TypeOrm error
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as QueryFailedError).message;
        break;
      case NotFoundException: // this is another TypeOrm error
      case EntityNotFoundError: // this is another TypeOrm error
        status = HttpStatus.NOT_FOUND;
        message = (exception as EntityNotFoundError).message;
        break;
      case CannotCreateEntityIdMapError: // and another
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        message = (exception as CannotCreateEntityIdMapError).message;
        break;
      case BadRequestException: // and another
        status = HttpStatus.BAD_REQUEST;
        message = (
          (exception as BadRequestException).getResponse() as any
        ).message;
        break;
      case UnauthorizedException: // and another
        status = HttpStatus.UNAUTHORIZED;
        message = (exception as UnauthorizedException).message;
        break;
      case ForbiddenException: // and another
        status = HttpStatus.FORBIDDEN;
        message = (exception as ForbiddenException).message;
        break;
      default:
        status = HttpStatus.INTERNAL_SERVER_ERROR;
    }

    response.status(status).json(GlobalResponseError(status, message));
  }
}
