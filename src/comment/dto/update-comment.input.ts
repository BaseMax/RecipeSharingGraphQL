import { IsMongoId } from "class-validator";
import { CreateCommentInput } from "./create-comment.input";
import { InputType, Field, Int, PartialType, OmitType } from "@nestjs/graphql";

@InputType()
export class UpdateCommentInput extends PartialType(
  OmitType(CreateCommentInput, ["recipeId"] as const)
) {
  @Field(() => String)
  @IsMongoId()
  id: string;
}

@InputType()
export class DeleteCommentInput {
  @Field(() => String)
  @IsMongoId()
  id: string;
}
