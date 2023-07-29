import { Injectable } from "@nestjs/common";
import { UpdateUserInput } from "./dto/update-user.input";
import { InjectModel } from "@nestjs/mongoose";
import { UserDocument } from "./interfaces/user.document";
import { Model } from "mongoose";
import { CreateUserInput } from "./dto/create-user.input";
import * as argon2 from "argon2";
@Injectable()
export class UserService {
  constructor(@InjectModel("User") private userModel: Model<UserDocument>) {}

  async create(createUserInput: CreateUserInput): Promise<UserDocument> {
    const hashedPassword = await argon2.hash(createUserInput.password);
    return await this.userModel.create({
      ...createUserInput,
      password: hashedPassword,
    });
  }

  


  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserInput: UpdateUserInput) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
