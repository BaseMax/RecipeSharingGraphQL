import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { RecipeService } from "./recipe.service";
import { Recipe } from "./entities/recipe.entity";
import { CreateRecipeInput } from "./dto/create-recipe.input";
import { UpdateRecipeInput } from "./dto/update-recipe.input";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.auth.guard";
import { GetCurrentUserId } from "src/common/get.current.userId";

@Resolver(() => Recipe)
export class RecipeResolver {
  constructor(private readonly recipeService: RecipeService) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Recipe)
  createRecipe(
    @Args("createRecipeInput") createRecipeInput: CreateRecipeInput,
    @GetCurrentUserId() userId: string
  ) {
    return this.recipeService.create(createRecipeInput, userId);
  }

  @Query(() => [Recipe], { name: "recipe" })
  findAll() {
    return this.recipeService.findAll();
  }

  @Query(() => Recipe, { name: "randomRecipe" })
  getRandomRecipe() {
    return this.recipeService.getRandomRecipe();
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Recipe)
  async updateRecipe(
    @Args("updateRecipeInput") updateRecipeInput: UpdateRecipeInput,
    @GetCurrentUserId() userId: string
  ) {
    const existRecipe = await this.recipeService.findByIdOrThrow(
      updateRecipeInput.recipeId
    );

    const isAllowed = this.recipeService.hasPermissionToModify(
      existRecipe,
      userId
    );
    if (!isAllowed) {
      throw new BadRequestException("you aren't allowed to modify");
    }

    return this.recipeService.update(updateRecipeInput, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Recipe, { name: "likeRecipe" })
  async likeRecipe(
    @Args("likeRecipeInput") updateRecipeInput: UpdateRecipeInput,
    @GetCurrentUserId() userId: string
  ) {
    const existRecipe = await this.recipeService.findByIdOrThrow(
      updateRecipeInput.recipeId
    );
    const isLikedByUser = await this.recipeService.isRecipeLiked(
      userId,
      updateRecipeInput.recipeId
    );

    if (!isLikedByUser) {
      return this.recipeService.likeRecipe(userId, updateRecipeInput.recipeId);
    }

    return this.recipeService.retrieveLike(userId, updateRecipeInput.recipeId);
  }

  @Query(() => [Recipe], { name: "PopularRecipes" })
  getPopularRecipes(@Args("limit", { type: () => Int }) limit: number) {
    return this.recipeService.getPopularRecipes(limit);
  }

  @Query(() => [Recipe], { name: "RecentRecipes" })
  getRecentRecipes(@Args("limit", { type: () => Int }) limit: number) {
    return this.recipeService.getRecentRecipes(limit);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Recipe)
  async removeRecipe(
    @Args("removeRecipeInput") removeRecipeInput: UpdateRecipeInput,
    @GetCurrentUserId() userId: string
  ) {
    const recipe = await this.recipeService.findByIdOrThrow(
      removeRecipeInput.recipeId
    );

    const isAllowed = this.recipeService.hasPermissionToModify(recipe, userId);
    if (!isAllowed) {
      throw new BadRequestException("you aren't allowed to modify");
    }
    return this.recipeService.remove(removeRecipeInput.recipeId);
  }
}
