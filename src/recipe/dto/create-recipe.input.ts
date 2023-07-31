import { InputType, Int, Field } from "@nestjs/graphql";
import { ArrayMinSize, IsNumber, IsString } from "class-validator";

@InputType()
class InstructionStepInput {
  @Field(() => Int)
  @IsNumber()
  step: number;

  @Field()
  @IsString()
  detail: string;
}

@InputType()
export class CreateRecipeInput {
  @Field()
  @IsString()
  title: string;

  @Field()
  @IsString()
  description: string;

  @Field(() => [String])
  @ArrayMinSize(1, { message: "must have at least one ingredient" })
  @IsString({ each: true })
  ingredients: string[];

  @Field(() => [InstructionStepInput  ])
  @ArrayMinSize(1, { message: "must have at least one step instruction" })
  instructions: string[];
}
