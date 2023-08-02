import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { CommentService } from "./comment.service";
import { Comment } from "./entities/comment.entity";
import { CreateCommentInput } from "./dto/create-comment.input";
import {
  DeleteCommentInput,
  UpdateCommentInput,
} from "./dto/update-comment.input";
import { BadRequestException, UseGuards } from "@nestjs/common";
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
  @Mutation(() => Comment)
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

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async updateComment(
    @Args("updateCommentInput") updateCommentInput: UpdateCommentInput,
    @GetCurrentUserId() userId: string
  ) {
    const existComment = await this.commentService.findByIdOrThrow(
      updateCommentInput.id
    );

    const isAllowed = this.commentService.hasPermissionToModify(
      existComment,
      userId
    );
    if (!isAllowed) {
      throw new BadRequestException("you aren't allowed to modify");
    }

    return this.commentService.update(updateCommentInput);
  }

  @UseGuards(JwtAuthGuard)
  @Mutation(() => Comment)
  async removeComment(
    @Args("deleteCommentInput") deleteCommentInput: DeleteCommentInput,
    @GetCurrentUserId() userId : string
  ) {
    const existComment = await this.commentService.findByIdOrThrow(
      deleteCommentInput.id
    );
    const isAllowed = this.commentService.hasPermissionToModify(
      existComment,
      userId
    );
    if (!isAllowed) {
      throw new BadRequestException("you aren't allowed to modify");
    }

    return this.commentService.remove(deleteCommentInput.id);
  }
}
