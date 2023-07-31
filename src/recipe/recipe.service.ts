import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateRecipeInput } from "./dto/create-recipe.input";
import { UpdateRecipeInput } from "./dto/update-recipe.input";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { RecipeDocument } from "./interfaces/recIpe.documents";

@Injectable()
export class RecipeService {
  constructor(
    @InjectModel("Recipe") private recipeModel: Model<RecipeDocument>
  ) {}
  async create(
    createRecipeInput: CreateRecipeInput,
    userId: string
  ): Promise<RecipeDocument> {
    return await this.recipeModel.create({
      ...createRecipeInput,
      authorId: userId,
    });
  }

  findAll() {
    return `This action returns all recipe`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recipe`;
  }

  async update(
    updateRecipeInput: UpdateRecipeInput,
    userId: string
  ): Promise<RecipeDocument> {
    const existRecipe = await this.findByIdOrThrow(updateRecipeInput.recipeId);
    const isAllowed = this.hasPermissionToModify(existRecipe, userId);
    if (!isAllowed) {
      throw new BadRequestException("you aren't allowed to modify");
    }

    await this.recipeModel.findByIdAndUpdate(updateRecipeInput.recipeId, {
      $set: updateRecipeInput,
    });

    const updatedRecipe = await this.recipeModel.findById(
      updateRecipeInput.recipeId
    );

    return updatedRecipe;
  }

  hasPermissionToModify(recipe: RecipeDocument, userId: string): Boolean {
    return recipe.authorId.toString() === userId ? true : false;
  }

  async findByIdOrThrow(recipeId: string): Promise<RecipeDocument> {
    const existRecipe = await this.recipeModel.findById(recipeId);
    if (!existRecipe) {
      throw new BadRequestException(
        "Recipe with this credentials doesn't exist"
      );
    }

    return existRecipe;
  }

  remove(id: number) {
    return `This action removes a #${id} recipe`;
  }
}
