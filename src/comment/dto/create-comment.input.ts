import { InputType, Int, Field } from "@nestjs/graphql";
import { IsMongoId, IsString } from "class-validator";

@InputType()
export class CreateCommentInput {
  @Field()
  @IsMongoId()
  recipeId: string;

  @Field()
  @IsString()
  content: string;
}
