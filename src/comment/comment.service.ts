import { Injectable } from "@nestjs/common";
import { CreateCommentInput } from "./dto/create-comment.input";
import { UpdateCommentInput } from "./dto/update-comment.input";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CommentDocument } from "./interfaces/comment.document";

@Injectable()
export class CommentService {
  constructor(
    @InjectModel("Comment") private commentModel: Model<CommentDocument>
  ) {}
  async create(
    createCommentInput: CreateCommentInput,
    userId: string
  ): Promise<CommentDocument> {
    return await this.commentModel.create({
      ...createCommentInput,
      authorId: userId,
    });
  }

  findAll() {
    return `This action returns all comment`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comment`;
  }

  update(id: number, updateCommentInput: UpdateCommentInput) {
    return `This action updates a #${id} comment`;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
