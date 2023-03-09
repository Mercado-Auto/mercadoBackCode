import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { Customer } from "src/modules/customers/entities/customer.entity";
import { Sale } from "src/modules/sales/entities/sale.entity";
import { User } from "src/modules/users/entities/user.entity";
import { Reseller } from "../modules/resellers/entities/reseller.entity";

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendConfirmation(user: User | Reseller | Customer, token: string) {
    const url = `${process.env.BASE_URL_WEB_APL}/confirm-email/?token=${token}`;

    await this.mailerService.sendMail({
      to: user instanceof Reseller ? user.responsible_email : user.email,

      subject: "Bem-vindos ao Mercado Auto! Confirme seu E-Mail",
      template: "./confirmation",
      context: {
        name: user.name,
        url,
        urlWeb: process.env.BASE_URL_WEB_APL,
      },
    });
  }

  async forgetPassword(user: User | Reseller | Customer, token: string) {
    const endpoint =
      user instanceof Customer
        ? `/auth/reset-app-password/?token=${token}`
        : `/auth/reset-password/?token=${token}`;

    const url = `${process.env.BASE_URL_WEB_APL}${endpoint}`;
    await this.mailerService.sendMail({
      to: user instanceof Reseller ? user.responsible_email : user.email,

      subject:
        "Se voce esqueceu a senha click no link a baixo para fazer a alteração.",
      template: "./forget_password",
      context: {
        name: user.name,
        url,
        urlWeb: process.env.BASE_URL_WEB_APL,
      },
    });
  }

  async sendResellerWelcome(user: User, token: string) {
    const url = `${process.env.BASE_URL_WEB_APL}/confirm-email/?token=${token}`;
    await this.mailerService.sendMail({
      to: user.email,
      subject: "Bem-vindos ao Mercado Auto!",
      template: "./reseller_welcome",
      context: {
        name: user.name,
        url,
        urlWeb: process.env.BASE_URL_WEB_APL,
      },
    });
  }

  async sendCustomerWelcome(customer: Customer, token: string) {
    const url = `${process.env.BASE_URL_WEB_APL}/confirm-email/?token=${token}`;

    await this.mailerService.sendMail({
      to: customer.email,

      subject: "Bem-vindos ao Mercado Auto!",
      template: "./customer_welcome",
      context: {
        name: customer.name,
        url,
        urlWeb: process.env.BASE_URL_WEB_APL,
      },
    });
  }

  async sendCustomerSalePaid(customer: Customer, sale: Sale) {
    await this.mailerService.sendMail({
      to: customer.email,

      subject: "Bem-vindos ao Mercado Auto!",
      template: "./customer_welcome",
      context: {
        name: customer.name,
      },
    });
  }
}
