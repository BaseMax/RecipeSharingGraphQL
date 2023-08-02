import { INestApplication, ValidationPipe } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import * as request from "supertest";
import { Model } from "mongoose";
import { Test } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import { getModelToken } from "@nestjs/mongoose";
import { RecipeDocument } from "src/recipe/interfaces/recIpe.documents";
import { CommentDocument } from "src/comment/interfaces/comment.document";

describe("Comment", () => {
  let app: INestApplication;
  let commentModel: Model<any>;
  let jwtService: JwtService;
  let configService: ConfigService;
  let recipeModel: Model<any>;
  let userInDb = {
    email: "test@gmail.com",
    password: "test",
    name: "jonathan",
  };

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

    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("authorization", token)
      .send({
        _query: createRecipeMutation,
        get query() {
          return this._query;
        },
        set query(value) {
          this._query = value;
        },
        variables: { createRecipeInput: { ...recipeInDb } },
      });

    return response.body.data.createRecipe;
  }

  async function createComment(
    token: string,
    recipeId: string
  ): Promise<CommentDocument> {
    const createCommentMutation = `mutation CreateComment($createCommentInput: CreateCommentInput!) {
      createComment(createCommentInput: $createCommentInput) {
        content
        authorId
        recipeId
        createdAt
        _id
      }
    }`;
    const response = await request(app.getHttpServer())
      .post("/graphql")
      .set("authorization", token)
      .send({
        query: createCommentMutation,
        variables: {
          createCommentInput: {
            recipeId: recipeId,
            content: "thanks it was good recipe",
          },
        },
      });

    return response.body.data.createComment;
  }

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule, ConfigModule.forRoot()],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    configService = new ConfigService();
    jwtService = new JwtService({ secret: configService.get("SECRET_KEY") });
    commentModel = app.get<Model<any>>(getModelToken("Comment"));
    recipeModel = app.get<Model<any>>(getModelToken("Recipe"));

    await commentModel.deleteMany({});
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("should create comment", () => {
    let token: string;
    let recipe: RecipeDocument;
    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);
    });

    const createCommentMutation = `mutation CreateComment($createCommentInput: CreateCommentInput!) {
        createComment(createCommentInput: $createCommentInput) {
          content
          authorId
          recipeId
          createdAt
          _id
        }
      }`;

    it("should give authentication error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: createCommentMutation,
          variables: {
            createCommentInput: {
              recipeId: "64c8f442e9b96dfc2b7d04c0",
              content: "thanks it was good recipe",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should get not found recipe to comment", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: createCommentMutation,
          variables: {
            createCommentInput: {
              recipeId: "64c8f442e9b96dfc2b7d04c0",
              content: "thanks it was good recipe",
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
          query: createCommentMutation,
          variables: {
            createCommentInput: {
              recipeId: "notMongoId",
              content: "thanks it was good recipe",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "recipeId must be a mongodb id"
      );
    });

    it("should create comment", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: createCommentMutation,
          variables: {
            createCommentInput: {
              recipeId: recipe._id.toString(),
              content: "thanks it was good recipe",
            },
          },
        });

      const { sub: userId } = jwtService.decode(token);
      const { authorId, content, recipeId } = response.body.data.createComment;
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(authorId).toBe(userId);
      expect(content).toBe("thanks it was good recipe");
      expect(recipeId).toBe(recipe._id.toString());
    });
  });

  describe("update comment", () => {
    let token: string;
    let recipe: RecipeDocument;
    let comment: CommentDocument;
    const updateCommentMutation = `mutation UpdateComment($updateCommentInput: UpdateCommentInput!) {
      updateComment(updateCommentInput: $updateCommentInput) {
        _id
        content
        authorId
        recipeId
        createdAt
      }
    }`;
    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);
      comment = await createComment(token, recipe._id.toString());
    });

    afterAll(async () => {
      await recipeModel.deleteMany();
      await recipeModel.deleteMany();
    });

    it("should give authentication error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: updateCommentMutation,
          variables: {
            updateCommentInput: {
              id: "64c90908dbb8c7ebdaf5aed9",
              content: null,
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give validation error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateCommentMutation,
          variables: {
            updateCommentInput: {
              id: "notMongodbId",
              content: "new content",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "id must be a mongodb id"
      );
    });

    it("should give not found", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateCommentMutation,
          variables: {
            updateCommentInput: {
              id: "64c9e67ef2dde04c068f10e3",
              content: "new content",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "Comment with this credentials doesn't exist"
      );
    });

    it("should give not allowed error", async () => {
      const token = jwtService.sign({
        sub: "64c74934cdd15e463c1e9802",
        name: "johnie",
      });

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateCommentMutation,
          variables: {
            updateCommentInput: {
              id: comment._id.toString(),
              content: "new content",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you aren't allowed to modify"
      );
    });
    it("should update comment", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: updateCommentMutation,
          variables: {
            updateCommentInput: {
              id: comment._id.toString(),
              content: "new content",
            },
          },
        });

      const { _id, content, recipeId } = response.body.data.updateComment;

      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expect(_id).toBe(comment._id.toString());
      expect(content).toBe("new content");
      expect(recipeId).toBe(recipe._id.toString());
    });
  });

  describe("delete comment", () => {
    let token: string;
    let recipe: RecipeDocument;
    let comment: CommentDocument;
    const deleteCommentMutation = `mutation RemoveComment($deleteCommentInput: DeleteCommentInput!) {
      removeComment(deleteCommentInput: $deleteCommentInput) {
        _id
        content
        authorId
        recipeId
        createdAt
      }
    }`;
    beforeAll(async () => {
      token = await login();
      recipe = await createRecipe(token);
      comment = await createComment(token, recipe._id.toString());
    });

    afterAll(async () => {
      await recipeModel.deleteMany();
      await recipeModel.deleteMany();
    });
    it("should give authentication error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: deleteCommentMutation,
          variables: {
            deleteCommentInput: {
              id: "64c9e67ef2dde04c068f10e2",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toBe(
        "you must login to get this feather"
      );
    });

    it("should give validation error", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: deleteCommentMutation,
          variables: {
            deleteCommentInput: {
              id: "notMongoId",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "id must be a mongodb id"
      );
    });

    it("should give not found", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: deleteCommentMutation,
          variables: {
            deleteCommentInput: {
              id: "64c74934cdd15e463c1e9802",
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "Comment with this credentials doesn't exist"
      );
    });

    it("should give not allowed error", async () => {
      const token = jwtService.sign({
        sub: "64c74934cdd15e463c1e9802",
        name: "johnie",
      });

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: deleteCommentMutation,
          variables: {
            deleteCommentInput: {
              id: comment._id.toString(),
            },
          },
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "you aren't allowed to modify"
      );
    });
    it("should delete comment", async () => {
      const response = await request(app.getHttpServer())
        .post("/graphql")
        .set("authorization", token)
        .send({
          query: deleteCommentMutation,
          variables: {
            deleteCommentInput: {
              id: comment._id.toString(),
            },
          },
        });


      const { _id, content, recipeId, authorId } =
        response.body.data.removeComment;
      const { sub: userId } = jwtService.decode(token);
      expect(response.status).toBe(200);
      expect(response.body.data).toBeTruthy();
      expect(_id).toBe(comment._id.toString());
      expect(content).toBe(comment.content);
      expect(recipeId).toBe(recipe._id.toString());
      expect(authorId).toBe(userId);
    });
  });
});
