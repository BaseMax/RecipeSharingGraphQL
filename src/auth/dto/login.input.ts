import { IsEmail, IsString } from "class-validator";
import { SignupInput } from "./signup.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  password: string;
}
