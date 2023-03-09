import { join } from "path";
import { Global, Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";
import { MailService } from "./mail.service";
import * as AWS from "aws-sdk";

@Global()
@Module({
  imports: [
    MailerModule.forRootAsync({
      useFactory: async (config: ConfigService) => ({
        transport: {
          SES: new AWS.SES({
            region: config.get("AWS_SES_REGION"),
            accessKeyId: config.get("AWS_SES_ACCESS_KEY"),
            secretAccessKey: config.get("AWS_SES_KEY_SECRET"),
          }),
          host: config.get("MAIL_HOST"),
          secure: true,
          auth: {
            user: config.get("MAIL_USER"),
            pass: config.get("MAIL_PASSWORD"),
          },
          debug: true,
        },
        defaults: {
          from: `${config.get("MAIL_FROM")}`,
        },
        template: {
          dir: join(__dirname, "templates"),
          adapter: new HandlebarsAdapter(),
          options: {
            strict: true,
          },
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
