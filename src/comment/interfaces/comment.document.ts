import { Document } from "mongoose";

export interface CommentDocument extends Document {
  readonly content: string;

  readonly authorId: string;

  readonly recipeId: string;

  readonly createdAt: Date;
}
