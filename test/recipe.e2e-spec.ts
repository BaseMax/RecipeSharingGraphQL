import { Body, INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { getModelToken } from "@nestjs/mongoose";
import { Test } from "@nestjs/testing";
import { Model } from "mongoose";
import { AppModule } from "src/app.module";
import { RecipeDocument } from "src/recipe/interfaces/recIpe.documents";
import { RecipeModule } from "src/recipe/recipe.module";
import * as request from "supertest";
import { recipes } from "./fakeData/fake.recipe";

describe("Recipe", () => {
  let app: INestApplication;
  let recipeModel: Model<any>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let userInDb = {
    email: "test@gmail.com",
    password: "test",
    name: "jonathan",
  };

  let recipeInDb = {
    description: "a delicious meal",
    ingredients: ["meat"],
    instructions: [
      {
        detail: "cook",
        step: 1,
      },
    ],
    title: "kebab",
  };
  async function createRecipe(token: string): Promise<RecipeDocument> {
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("authorization", token)
      .send({
        query: createRecipeMutation,
        variables: { createRecipeInput: { ...recipeInDb } },
      });

    return response.body.data.createRecipe;
  }
  async function login() {
    const variables = {
      login: {
        email: userInDb.email,
        password: userInDb.password,
      },
    };
    const mutation = `mutation Login($login: LoginInput!) {
      login(login: $login) {
        token
        name
      } 
    }   `;

    const response = await request(app.getHttpServer()).post("/graphql").send({
      query: mutation,
      variables,
    });

    const { name, token } = response.body.data.login;
    return token;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ConfigModule.forRoot()],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    configService = new ConfigService();
    jwtService = new JwtService({ secret: configService.get("SECRET_KEY") });
    recipeModel = app.get<Model<any>>(getModelToken("Recipe"));
    await recipeModel.deleteMany({});
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const createRecipeMutation = `mutation CreateRecipe($createRecipeInput: CreateRecipeInput!) {
    createRecipe(createRecipeInput: $createRecipeInput) {
      title
      authorId
      ingredients
      instructions {
        detail
        step
      }
      description
      _id
    }
  }`;

  describe("creating recipe", () => {
    it("should create recipe", async () => {
      const variables = {
        createRecipeInput: {
          description: "a",
          ingredients: ["meat"],
          instructions: [
            {
              detail: "cook",
              step: 1,
            },
          ],
          title: "kebab",
        },
      };

      const token = await login();
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: createRecipeMutation,
          variables,
        });

      const { title, description, ingredients, instruction } =
        response.body.data.createRecipe;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(title).toBe(variables.createRecipeInput.title);
      expect(description).toBe(variables.createRecipeInput.description);
      expect(ingredients).toContain(variables.createRecipeInput.ingredients[0]);
    });

    it("should give authentication error", async () => {
      const variables = {
        createRecipeInput: {
          description: "a brief description",
          ingredients: ["meat"],
          instructions: [
            {
              detail: "cook,don't make rush :)",
              step: 1,
            },
          ],
          title: "kebab",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: createRecipeMutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give validation error", async () => {
      const token = await login();
      const variables = {
        createRecipeInput: {
          description: "a brief description",
          ingredients: ["meat"],
          instructions: 1,
          title: 12,
        },
      };

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: createRecipeMutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeUndefined();
    });
  });

  describe("updating recipe", () => {
    let token: string;
    let recipe: RecipeDocument;
    let variables: any;
    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);
      variables = {
        updateRecipeInput: {
          recipeId: recipe._id.toString(),
          description: "updated delicious meal",
          title: "delicious kebab",
        },
      };
    });
    const updateMutation = `mutation UpdateRecipe($updateRecipeInput: UpdateRecipeInput!) {
      updateRecipe(updateRecipeInput: $updateRecipeInput) {
        authorId
        description
        title
        instructions {
          detail
          step
        }
        ingredients
        _id
      }
    }`;

    it("should update recipe ", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateMutation,
          variables,
        });

      const { description, title, ingredients, _id } =
        response.body.data.updateRecipe;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(title).toBe(variables.updateRecipeInput.title);
      expect(ingredients).toContain(recipe.ingredients[0]);
      expect(description).toBe(variables.updateRecipeInput.description);
      expect(_id).toBe(recipe._id.toString());
    });

    it("should give authentication error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: updateMutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give validation error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateMutation,
          variables: {
            updateRecipeInput: {
              recipeId: "3",
              description: "changed",
              title: "also changed",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "recipeId must be a valid Id"
      );
    });

    it("should give not found error", async () => {
      // const token =
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateMutation,
          variables: {
            updateRecipeInput: {
              recipeId: "64c75080b79a0d6d60d6c9d2",
              description: "changed",
              title: "also changed",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "Recipe with this credentials doesn't exist"
      );
    });

    it("should give error not allowed ", async () => {
      const token = jwtService.sign({
        sub: "64c74934cdd15e463c1e9802",
        name: "johnie",
      });

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateMutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you aren't allowed to modify"
      );
    });
  });

  describe("like Recipe", () => {
    let token: string;
    let recipe: RecipeDocument;
    let variables: any;

    let likeMutation = `mutation LikeRecipe($likeRecipeInput: UpdateRecipeInput!) {
      likeRecipe(likeRecipeInput: $likeRecipeInput) {
        title
        instructions {
          detail
          step
        }
        ingredients
        description
        authorId
        _id
        numberOfLikes 
        likes
      }
    }`;

    // async function createRecipe(){}

    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);

      variables = {
        likeRecipeInput: {
          recipeId: recipe._id.toString(),
        },
      };
    });

    it("should give authentication error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: likeMutation,
          variables: {
            likeRecipeInput: {
              recipeId: "64c75080b79a0d6d60d6c9d2",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give not found error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: likeMutation,
          variables: {
            likeRecipeInput: {
              recipeId: "64c75080b79a0d6d60d6c9d2",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "Recipe with this credentials doesn't exist"
      );
    });
    it("should like the recipe and retrieve it back", async () => {
      let response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: likeMutation,
          variables: {
            likeRecipeInput: {
              recipeId: recipe._id.toString(),
            },
          },
        });

      let { numberOfLikes, _id } = response.body.data.likeRecipe;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(numberOfLikes).toBe(1);
      expect(_id).toBe(recipe._id.toString());

      response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: likeMutation,
          variables: {
            likeRecipeInput: {
              recipeId: recipe._id.toString(),
            },
          },
        });

      _id = response.body.data.likeRecipe._id;
      numberOfLikes = response.body.data.likeRecipe.numberOfLikes;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(numberOfLikes).toBe(0);
      expect(_id).toBe(recipe._id.toString());
    });
  });

  describe("delete recipe", () => {
    let token: string;
    let recipe: RecipeDocument;
    let variables: any;
    const removeRecipeMutation = `mutation RemoveRecipe($removeRecipeInput: UpdateRecipeInput!) {
      removeRecipe(removeRecipeInput: $removeRecipeInput) {
        title
        likes
        numberOfLikes
        instructions {
          detail
          step
        }
        ingredients
        description
        _id
        authorId
      }
    }`;

    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);

      variables = {
        likeRecipeInput: {
          recipeId: recipe._id.toString(),
        },
      };
    });

    it("should give authentication", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: removeRecipeMutation,
          variables: {
            removeRecipeInput: {
              recipeId: "",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give not found error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: removeRecipeMutation,
          variables: {
            removeRecipeInput: {
              recipeId: "64c75080b79a0d6d60d6c9d2",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "Recipe with this credentials doesn't exist"
      );
    });

    it("should give validation error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: removeRecipeMutation,
          variables: {
            removeRecipeInput: {
              recipeId: "notMongodbId",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "recipeId must be a valid Id"
      );
    });

    it("should give error not allowed ", async () => {
      const token = jwtService.sign({
        sub: "64c74934cdd15e463c1e9802",
        name: "johnie",
      });

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: removeRecipeMutation,
          variables: {
            removeRecipeInput: {
              recipeId: recipe._id.toString(),
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you aren't allowed to modify"
      );
    });

    it("should give deleted recipe back", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: removeRecipeMutation,
          variables: {
            removeRecipeInput: {
              recipeId: recipe._id.toString(),
            },
          },
        });

      const { description, title, ingredients, _id } =
        response.body.data.removeRecipe;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(title).toBe(recipe.title);
      expect(ingredients).toContain(recipe.ingredients[0]);
      expect(description).toBe(recipe.description);
      expect(_id).toBe(recipe._id.toString());
    });
  });

  describe("getting recipe", () => {
    let token: string;
    // let recipe: RecipeDocument;
    // let variables: any;

    beforeAll(async () => {
      token = await login();
      await recipeModel.insertMany(recipes);
    });

    it("should get popular recipes", async () => {
      const popularRecipes = `query PopularRecipes($limit: Int!) {
        PopularRecipes(limit: $limit) {
          _id
          title
          numberOfLikes
        }
      }`;
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: popularRecipes,
          variables: {
            limit: 3,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();

      const recipes = response.body.data.PopularRecipes;
      const mostPopularRecipe = recipes[0];
      const secondMostPopularRecipe = recipes[1];
      const lessPopularRecipe = recipes[recipes.length - 1];
      expect(mostPopularRecipe.numberOfLikes).toBeGreaterThanOrEqual(
        secondMostPopularRecipe.numberOfLikes
      );
      expect(mostPopularRecipe.numberOfLikes).toBeGreaterThan(
        lessPopularRecipe.numberOfLikes
      );
    });

    it("should get most recent recipes", async () => {
      const recentRecipesQuery = `query RecentRecipes($limit: Int!) {
        RecentRecipes(limit: $limit) {
          _id
          title
          createdAt
        }
      }`;
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: recentRecipesQuery,
          variables: {
            limit: 3,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(response.body.errors).toBeUndefined();
      const recipes = response.body.data.RecentRecipes;
      const firstRecipeCreatedTime = new Date(recipes[0].createdAt);
      const secondRecipeCreatedTime = new Date(recipes[1].createdAt);
      const isFirstRecipeMostRecent =
        firstRecipeCreatedTime < secondRecipeCreatedTime;

      expect(isFirstRecipeMostRecent).toBeTruthy();
    });

    it("should get top authors", async () => {
      const topUserQuery = `query TopUsers($limit: Int!) {
        topUsers(limit: $limit) {
          email
          name
          createdAt
          recipes_count
          _id
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: topUserQuery,
          variables: {
            limit: 3,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it("should get a random recipe", async () => {
      const randomRecipeQuery = `query RandomRecipe {
        randomRecipe {
          _id
          title
          authorId
          numberOfLikes
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: randomRecipeQuery,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
    });

    it("should get authentication error ", async () => {
      const userOwnRecipe = `query UserOwnRecipe {
        userOwnRecipe {
          _id
          title
          authorId
          createdAt
          numberOfLikes
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: userOwnRecipe,
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should get user own recipes", async () => {
      const userOwnRecipe = `query UserOwnRecipe {
        userOwnRecipe {
          _id
          title
          authorId
          createdAt
          numberOfLikes
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: userOwnRecipe,
        });

      const { sub: userId } = jwtService.decode(token);

      expect(response.body.data).toBeTruthy();
      expect(response.body.data.userOwnRecipe[0].authorId).toBe(userId);
    });

    it("should get user favorite recipes", async () => {
      const userFavoriteRecipeQuery = `query UserFavoriteRecipes($limit: Int!) {
        userFavoriteRecipes(limit: $limit) {
          _id
          authorId
          likes
          createdAt
          title
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: userFavoriteRecipeQuery,
          variables: {
            limit: 3,
          },
        });

      const { sub: userId } = jwtService.decode(token);

      expect(response.body.data.userFavoriteRecipes[0].likes).toContain(userId);
    });

    it("should get authentication error ", async () => {
      const userFavoriteRecipeQuery = `query UserFavoriteRecipes($limit: Int!) {
        userFavoriteRecipes(limit: $limit) {
          _id
          authorId
          likes
          createdAt
          title
        }
      }`;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: userFavoriteRecipeQuery,
          variables: {
            limit: 3,
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });
  });
});
