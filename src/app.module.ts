import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { MongooseModule } from "@nestjs/mongoose";
import { UserModule } from "./user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { GraphQLModule } from "@nestjs/graphql";
import { GraphQLError, GraphQLFormattedError } from "graphql";
import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { join } from "path";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { APP_FILTER } from "@nestjs/core";
import { GraphqlErrorFilter } from "./common/error.handler";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      autoSchemaFile: join(process.cwd(), "src/schema.gql"),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      driver: ApolloDriver,
      formatError: (error: GraphQLError) => {
        // console.log(error);

        const graphQLFormattedError: GraphQLFormattedError = {
          message:
            (error?.extensions.originalError as any)?.message ||
            (error?.extensions?.exception as any)?.response?.message ||
            error?.message,
        };

        return graphQLFormattedError;
      },
    }),
    MongooseModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        uri: configService.get("DATABASE_URL"),
      }),
      inject: [ConfigService],
    }),

    AuthModule,

    UserModule,
  ],
  controllers: [],
  providers: [
    // {
    //   provide: APP_FILTER,
    //   useClass: GraphqlErrorFilter,
    // },
  ],
})
export class AppModule {}
