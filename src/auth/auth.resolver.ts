import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { Auth } from "./entities/auth.entity";
import { SignupInput } from "./dto/signup.input";
import { LoginInput } from "./dto/login.input";

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth, { name: "signup" })
  signup(@Args("signup") signupInput: SignupInput) {
    return this.authService.signup(signupInput);
  }

  @Mutation(() => Auth, { name: "login" })
  login(@Args("login") loginInput: LoginInput) {
    return this.authService.login(loginInput);
  }
}
