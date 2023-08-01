import { Document } from "mongoose";

export interface RecipeDocument extends Document {
  readonly title: string;
  readonly description: string;
  readonly ingredients: string[];
  readonly authorId: string;
  readonly instructions: Instruction[];
  readonly likes?: string[];
  readonly numberOfLikes: number;
  readonly createdAt: Date;
}

interface Instruction {
  readonly step: number;
  readonly detail: string;
}
