import { InputType, Int, Field } from "@nestjs/graphql";
import { IsEmail, IsString, Validate } from "class-validator";
import { CustomMatchPasswords } from "../decorators/password.match";

@InputType()
export class SignupInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  password: string;

  @Field()
  @Validate(CustomMatchPasswords, ["password"])
  confirmPassword: string;
}
