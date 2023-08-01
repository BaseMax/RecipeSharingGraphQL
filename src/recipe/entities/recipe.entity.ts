import { ObjectType, Field, Int } from "@nestjs/graphql";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@ObjectType()
@Schema()
class InstructionStep {
  @Field(() => Int)
  @Prop({ type: Number, required: true }) // Use type: Number for 'step'
  step: number;

  @Field()
  @Prop({ type: String, required: true }) // Use type: String directly for 'detail'
  detail: string;
}

export const InstructionStepSchema =
  SchemaFactory.createForClass(InstructionStep);

@Schema()
@ObjectType()
export class Recipe {
  @Field()
  _id: string;
  @Field()
  @Prop({ type: String })
  title: string;

  @Field()
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  })
  authorId: string;

  @Field(() => [String])
  @Prop({ type: [String], required: true })
  ingredients: string[];

  @Field(() => [InstructionStep])
  @Prop({ type: [{ type: InstructionStepSchema }], required: true })
  instructions: InstructionStep[];

  @Field()
  @Prop({ type: String, required: true })
  description: string;

  @Field(() => [String])
  @Prop({
    type: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  })
  likes: string[];

  @Field()
  @Prop({ typ: Number, default: 0 })
  numberOfLikes: number;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
