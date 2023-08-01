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

  async findByEmail(email: string): Promise<UserDocument> {
    return await this.userModel.findOne({
      email: email,
    });
  }

  async getTopUsers(limit: number): Promise<UserDocument[]> {
    const users = await this.userModel
      .aggregate([
        {
          $lookup: {
            from: "recipes",
            localField: "_id",
            foreignField: "authorId",
            as: "numberOfUserRecipes",
          },
        },
        {
          $addFields: {
            recipes_count: { $size: "$numberOfUserRecipes" },
          },
        },
        {
          $project: {
            name: 1,
            _id: 1,
            email: 1,
            createdAt: 1,
            recipes_count: 1,
          },
        },
        {
          $sort: { recipes_count: -1 },
        },
      ])
      .limit(limit);
    console.log(users);

    return users;
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
