import { BadRequestException, Injectable } from "@nestjs/common";
import { SignupInput } from "./dto/signup.input";
import { LoginInput } from "./dto/login.input";
import { UserService } from "src/user/user.service";
import { JwtPayload } from "./interfaces/jwt.payload";
import { JwtService } from "@nestjs/jwt";
import { Auth } from "./entities/auth.entity";

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
