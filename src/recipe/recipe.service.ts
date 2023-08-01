import { BadRequestException, Injectable } from "@nestjs/common";
import { CreateRecipeInput } from "./dto/create-recipe.input";
import { UpdateRecipeInput } from "./dto/update-recipe.input";
import { InjectModel } from "@nestjs/mongoose";
import mongoose, { Model, ObjectId } from "mongoose";
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
    await this.recipeModel.findByIdAndUpdate(updateRecipeInput.recipeId, {
      $set: updateRecipeInput,
    });

    return await this.recipeModel.findById(updateRecipeInput.recipeId, {
      __v: 0,
    });
  }

  hasPermissionToModify(recipe: RecipeDocument, userId: string): Boolean {
    return recipe.authorId.toString() === userId ? true : false;
  }

  async findByIdOrThrow(recipeId: string): Promise<RecipeDocument> {
    const existRecipe = await this.recipeModel.findById(recipeId, { __v: 0 });
    if (!existRecipe) {
      throw new BadRequestException(
        "Recipe with this credentials doesn't exist"
      );
    }

    return existRecipe;
  }

  async likeRecipe(userId: string, recipeId: string): Promise<RecipeDocument> {
    await this.recipeModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(recipeId),
      },
      {
        $push: { likes: userId },
        $inc: { numberOfLikes: 1 },
      }
    );

    return await this.recipeModel.findById(recipeId, { __v: 0 });
  }

  async retrieveLike(
    userId: string,
    recipeId: string
  ): Promise<RecipeDocument> {
    await this.recipeModel.updateOne(
      {
        _id: new mongoose.Types.ObjectId(recipeId),
      },
      {
        $pull: { likes: userId },
        $inc: { numberOfLikes: -1 },
      }
    );

    return await this.recipeModel.findById(recipeId, { __v: 0 });
  }

  async isRecipeLiked(userId: string, recipeId: string): Promise<Boolean> {
    const recipe = await this.recipeModel.findOne({
      _id: new mongoose.Types.ObjectId(recipeId),
      likes: new mongoose.Types.ObjectId(userId),
    });

    return recipe ? true : false;
  }

  async remove( recipeId: string): Promise<RecipeDocument> {
    return await this.recipeModel.findByIdAndDelete(recipeId);
  }
}
