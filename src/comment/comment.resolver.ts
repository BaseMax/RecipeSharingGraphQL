import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { CommentService } from "./comment.service";
import { Comment } from "./entities/comment.entity";
import { CreateCommentInput } from "./dto/create-comment.input";
import { UpdateCommentInput } from "./dto/update-comment.input";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/guards/jwt.auth.guard";
import { GetCurrentUserId } from "src/common/get.current.userId";
import { RecipeService } from "src/recipe/recipe.service";

@Resolver(() => Comment)
export class CommentResolver {
  constructor(
    private readonly commentService: CommentService,
    private readonly recipeService: RecipeService
  ) {}

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment )
  async createComment(
    @Args("createCommentInput") createCommentInput: CreateCommentInput,
    @GetCurrentUserId() userId: string
  ) {
    const recipe = await this.recipeService.findByIdOrThrow(
      createCommentInput.recipeId
    );
    return this.commentService.create(createCommentInput, userId);
  }

  @Query(() => [Comment], { name: "comment" })
  findAll() {
    return this.commentService.findAll();
  }

  @Query(() => Comment, { name: "comment" })
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.commentService.findOne(id);
  }

  @Mutation(() => Comment)
  updateComment(
    @Args("updateCommentInput") updateCommentInput: UpdateCommentInput
  ) {
    return this.commentService.update(
      updateCommentInput.id,
      updateCommentInput
    );
  }

  @Mutation(() => Comment)
  removeComment(@Args("id", { type: () => Int }) id: number) {
    return this.commentService.remove(id);
  }
}
