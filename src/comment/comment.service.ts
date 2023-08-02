import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateCommentInput } from "./dto/create-comment.input";
import { UpdateCommentInput } from "./dto/update-comment.input";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model } from "mongoose";
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

  async update(
    updateCommentInput: UpdateCommentInput
  ): Promise<CommentDocument> {
    const updatedComment = await this.commentModel.updateOne(
      { _id: new mongoose.Types.ObjectId(updateCommentInput.id) },
      {
        ...updateCommentInput,
      }
    );

    return await this.commentModel.findById(updateCommentInput.id);
  }

  hasPermissionToModify(comment: CommentDocument, userId: string): Boolean {
    return comment.authorId.toString() === userId ? true : false;
  }

  async findByIdOrThrow(commentId: string): Promise<CommentDocument> {
    const existComment = await this.commentModel.findById(commentId, {
      __v: 0,
    });
    if (!existComment) {
      throw new BadRequestException(
        "Comment with this credentials doesn't exist"
      );
    }

    return existComment;
  }

  remove(id: number) {
    return `This action removes a #${id} comment`;
  }
}
