import { Module } from "@nestjs/common";
import { CommentService } from "./comment.service";
import { CommentResolver } from "./comment.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { CommentSchema } from "./entities/comment.entity";
import { AuthModule } from "src/auth/auth.module";
import { RecipeService } from "src/recipe/recipe.service";
import { RecipeModule } from "src/recipe/recipe.module";
import { RecipeSchema } from "src/recipe/entities/recipe.entity";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Comment", schema: CommentSchema },
      { schema: RecipeSchema, name: "Recipe" },
    ]),
    AuthModule,
    RecipeModule,
  ],
  providers: [CommentResolver, CommentService, RecipeService],
})
export class CommentModule {}
