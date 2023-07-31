import { Document } from "mongoose";

export interface RecipeDocument extends Document {
  readonly title: string;
  readonly description: string;
  readonly ingredients: string[];
  readonly authorId: string;
  readonly instructions: Instruction[];
}

interface Instruction {
  readonly step: number;
  readonly detail: string;
}
