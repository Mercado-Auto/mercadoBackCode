import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { join } from "path";

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: "postgres",
      host: "rosie.db.elephantsql.com",
      port: Number(process.env.DB_PORT) || 5432,
      username: "zzgwvtfi",
      password: "xSnI7acsILjBsjWSGrOySIJTTjnekQh9",
      database: "zzgwvtfi",
      entities: [join(__dirname, "..", "**", "*.entity.{ts,js}")],
      migrations: [join(__dirname, "migrations", "*.{ts,js}")],
      synchronize: true,
    }),
  ],
})
export class DatabaseModule { }
