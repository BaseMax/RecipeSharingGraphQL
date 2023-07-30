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
    // console.log(exception.response);

    const gqlHost = GqlArgumentsHost.create(host);
    const ctx = gqlHost.getContext();

    const inferredDatabaseError = this.inferDatabaseError(exception);
    const inferredClassValidatorError =
      this.inferClassValidatorError(exception);

    // console.log(inferredClassValidatorError);

    const errorResponse = {
      message:
        inferredDatabaseError?.message ||
        inferredClassValidatorError.message ||
        exception.message ||
        "Internal server error",
    };

    const status =
      inferredDatabaseError?.status ||
      inferredClassValidatorError.status ||
      exception.status ||
      HttpStatus.INTERNAL_SERVER_ERROR;

    throw new HttpException(errorResponse.message, status);
  }

  inferDatabaseError(exception: any) {
    if (exception.code === 11000) {
      return { message: "there is a duplication", status: 409 };
    }
  }

  inferClassValidatorError(exception: any) {
    if (exception?.response?.message.length > 0) {
      return {
        message: exception.response.message,
        status: exception.response.statusCode,
      };
    }
  }
}
