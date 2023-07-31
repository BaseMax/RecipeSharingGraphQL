import { IsMongoId, IsNotEmpty, IsNumber, IsString } from "class-validator";
import { CreateRecipeInput } from "./create-recipe.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateRecipeInput extends PartialType(CreateRecipeInput) {
  @Field(() => String)
  @IsMongoId({ message: "recipeId must be a valid Id" })
  @IsNotEmpty()
  recipeId: string;
}
