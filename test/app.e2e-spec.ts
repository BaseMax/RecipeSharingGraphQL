import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { Model } from "mongoose";
import { UserDocument } from "src/user/interfaces/user.document";
import { getModelToken } from "@nestjs/mongoose";
import * as argon2 from "argon2";

describe("AppController (e2e)", () => {
  let app: INestApplication;
  let userModel: Model<any>;
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

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    userModel = app.get<Model<any>>(getModelToken("User"));
    recipeModel = app.get<Model<any>>(getModelToken("Recipe"));
    await userModel.deleteMany({});
    await recipeModel.deleteMany({});
    await userModel.create({
      ...userInDb,
      password: await argon2.hash(userInDb.password),
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("signup", () => {
    it("should signup", async () => {
      const variables = {
        email: "test2@gmail.com",
        password: "test",
        name: "john smith",
      };
      const mutation = `mutation Signup {
        signup(
            signup: {email: "${variables.email}", name: "${variables.name}", password: "${variables.password}", confirmPassword: "${variables.password}"}
        ) {
            token
            name
        }
    }
    `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
        });

      expect(response.status).toBe(200);
      expect(response.body.data.signup.name).toBe(variables.name);
    });

    it("should give validation error", async () => {
      const variables = {
        signup: {
          email: "testgmial.com",
          name: "john",
          password: "password",
          confirmPassword: "wrong",
        },
      };
      const mutation = `  mutation Signup($signup: SignupInput!) {
        signup(signup: $signup) {
          token
          name
        }
      } `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors).toBeDefined();

      const validationErrors = response.body.errors[0].message;

      expect(validationErrors).toContain("email must be an email");
      expect(validationErrors).toContain("Passwords do not match!");
    });

    it("should give user already exist error", async () => {
      const variables = {
        signup: {
          email: userInDb.email,
          name: "john",
          password: "password",
          confirmPassword: "password",
        },
      };

      const mutation = `  mutation Signup($signup: SignupInput!) {
          signup(signup: $signup) {
            token
            name
          }
        } `;

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
          variables,
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toBe(
        "user with these credentials already exists"
      );
    });
  });

  describe("login", () => {
    const mutation = `mutation Login($login: LoginInput!) {
      login(login: $login) {
        token
        name
      } 
    }   `;

    it("should login", async () => {
      const variables = {
        login: {
          email: userInDb.email,
          password: userInDb.password,
        },
      };

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
          variables,
        });

      const { name, token } = response.body.data.login;
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(name).toBe(userInDb.name);
      expect(token).toBeDefined();
    });

    it("should give validation error", async () => {
      const variables = {
        login: {
          email: "testmailexampl.com",
          password: "jkkj",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
          variables,
        });

      const validationErrors = response.body.errors[0].message;
      expect(response.body.data).toBeNull();

      expect(validationErrors).toContain("email must be an email");
    });

    it("should give error (user not exists)", async () => {
      const variables = {
        login: {
          email: "john@gmail.com",
          password: "john",
        },
      };

      const response = await request(app.getHttpServer())
        .post("/graphql")
        .send({
          query: mutation,
          variables,
        });

      expect(response.body.data).toBeNull();
      expect(response.body.errors[0].message).toContain(
        "there are no account with this credentials , please try to signup"
      );
    });
  });
});
