import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { Auth } from "./entities/auth.entity";
import { SignupInput } from "./dto/signup.input";
import { LoginInput } from "./dto/login.input";

@Resolver(() => Auth)
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => Auth , {name :"signup"})
  signup(@Args("signup") signupInput: SignupInput) {
    return this.authService.signup(signupInput);
  }

  @Query(() => [Auth], { name: "auth" })
  findAll() {
    return this.authService.findAll();
  }

  @Query(() => Auth, { name: "auth" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.authService.findOne(id);
  }

 

  @Mutation(() => Auth)
  removeAuth(@Args("id", { type: () => Int }) id: number) {
    return this.authService.remove(id);
  }
}
