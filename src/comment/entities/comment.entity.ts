import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
@ObjectType()
export class Comment {
  @Field()
  _id: string;
  @Field()
  @Prop({ type: String })
  content: string;

  @Field()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  authorId: string;

  @Field()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "Recipe",
    required: true,
  })
  recipeId: string;

  @Field()
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
