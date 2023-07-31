import { Module } from "@nestjs/common";
import { RecipeService } from "./recipe.service";
import { RecipeResolver } from "./recipe.resolver";
import { MongooseModule } from "@nestjs/mongoose";
import { RecipeSchema } from "./entities/recipe.entity";
import { AuthModule } from "src/auth/auth.module";

@Module({
  imports: [
    MongooseModule.forFeature([{ schema: RecipeSchema, name: "Recipe" }]),

    AuthModule,
  ],
  providers: [RecipeResolver, RecipeService],
})
export class RecipeModule {}
