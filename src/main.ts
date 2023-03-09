import * as dotenv from 'dotenv'
dotenv.config()

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import helmet from "helmet";

import { AppModule } from "./modules/app/app.module";
import { GlobalExceptionFilter } from "./utils/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      credentials: true
    }
  });
  app.use(helmet());
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.setGlobalPrefix("/api");

  const config = new DocumentBuilder()
    .setTitle("Mercado Auto API")
    .setDescription("The rest specifications of Mercado Auto API")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(process.env.PORT || 8080);
}
bootstrap();
