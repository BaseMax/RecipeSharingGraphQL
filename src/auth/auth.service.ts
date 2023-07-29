import { BadRequestException, Injectable } from "@nestjs/common";
import { SignupInput } from "./dto/signup.input";
import { LoginInput } from "./dto/login.input";
import { UserService } from "src/user/user.service";
import { JwtPayload } from "./interfaces/jwt.payload";
import { JwtService } from "@nestjs/jwt";
import { Auth } from "./entities/auth.entity";
import * as argon2 from "argon2";

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService
  ) {}
  async signup(signupInput: SignupInput): Promise<Auth> {
    const alreadyExistsUser = await this.userService.findByEmail(
      signupInput.email
    );

    if (alreadyExistsUser) {
      throw new BadRequestException(
        "user with these credentials already exists  "
      );
    }

    const user = await this.userService.create({ ...signupInput });

    const token = this.getToken({ sub: user._id, name: user.name });
    return { token, name: user.name };
  }

  async login(loginInput: LoginInput): Promise<Auth> {
    const existUser = await this.userService.findByEmail(loginInput.email);

    if (!existUser) {
      throw new BadRequestException(
        "there are no account with this credentials , please try to logisn"
      );
    }

    const isValidPassword = argon2.verify(
      existUser.password,
      loginInput.password
    );

    if (!isValidPassword)
      throw new BadRequestException("credentials aren't correct");

    const token = this.getToken({ name: existUser.name, sub: existUser._id });

    return { token, name: existUser.name };
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private getToken(JwtPayload: JwtPayload): string {
    return this.jwtService.sign(JwtPayload);
  }
}
