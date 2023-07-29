import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { GqlArgumentsHost, GqlExceptionFilter } from "@nestjs/graphql";

@Catch()
export class GraphqlErrorFilter implements GqlExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();

    const inferredDatabaseError = this.inferDatabaseError(exception);

    const errorResponse = {
      message:
        inferredDatabaseError?.message ||
        exception.message ||
        "Internal server error",
    };

    const status =
      inferredDatabaseError?.status ||
      exception.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;
    throw new HttpException(errorResponse.message, status);
  }

  inferDatabaseError(exception: any) {
    if (exception.code === 11000) {
      return { message: "you are already in a match", status: 409 };
    }
  }
}
