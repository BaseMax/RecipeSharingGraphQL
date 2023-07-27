# Recipe Sharing Platform GraphQL TypeScript

This is a TypeScript-based GraphQL API for a recipe sharing platform. It allows users to query for recipes, search recipes by ingredients, and also enables them to submit their own recipes.

Develop a GraphQL API for a recipe sharing platform. Users can query for recipes, search by ingredients, and submit their own recipes.

## Features

- **Query recipes**: Users can query for recipes available on the platform.
- **Search by ingredients**: Users can search for recipes based on the ingredients they have.
- **Submit recipes**: Authenticated users can submit their own recipes to share with the community.

## Technologies Used

- **TypeScript**: The entire API is written in TypeScript to provide a strongly-typed development experience.
- **GraphQL**: The API is built using GraphQL to provide efficient and flexible data retrieval capabilities.
- **Node.js**: The API runs on Node.js to handle HTTP requests and serve the GraphQL endpoint.
- **Express**: Express.js is used as the web server framework to handle incoming HTTP requests.
- **Database**: MongoDB or any other database of choice can be used to store recipes and user data.

## Getting Started

- Node.js (version 14 or higher)
- NPM (Node Package Manager)

## Installation

**Clone the repository:**

```bash
git clone https://github.com/your-username/recipe-sharing-api.git
cd recipe-sharing-api
```

**Install dependencies:**

```bash
npm install
```

**Set up environment variables:**

Create a `.env` file in the root directory and add the following environment variables:

```makefile
DB_URL=mongodb://your-mongodb-url
PORT=3000
```

**Start the development server:**

```
npm run dev
```

The API will be accessible at `http://localhost:3000/graphql`.

## Additional GraphQL

### Additional Queries

**User Profile Query:**

This query allows users to retrieve their own profile information.

```graphql
type Query {
  profile: UserProfile!
}

type UserProfile {
  id: ID!
  username: String!
  email: String!
  recipes: [Recipe!]!
}
```

**Popular Recipes Query:**

This query returns a list of popular recipes based on the number of likes and views.

```graphql
type Query {
  popularRecipes(limit: Int!): [Recipe!]!
}
```

### Additional Mutations

**Update Recipe Mutation:**

This mutation allows users to update their submitted recipes.

```graphql
type Mutation {
  updateRecipe(recipeId: ID!, input: RecipeInput!): Recipe!
}

input RecipeInput {
  title: String!
  description: String!
  ingredients: [String!]!
  instructions: [String!]!
}
```

**Like Recipe Mutation:**

This mutation allows users to like a recipe.

```graphql
type Mutation {
  likeRecipe(recipeId: ID!): Recipe!
}
```

**Delete Recipe Mutation:**

This mutation allows users to delete their submitted recipes.

```graphql
type Mutation {
  deleteRecipe(recipeId: ID!): ID!
}
```

**User Registration Mutation:**

This mutation allows new users to register on the platform.

```graphql
type Mutation {
  register(input: RegisterInput!): User!
}

input RegisterInput {
  username: String!
  email: String!
  password: String!
}
```

**User Login Mutation:**

This mutation allows users to log in to the platform and obtain an access token.

```graphql
type Mutation {
  login(input: LoginInput!): AuthPayload!
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  user: User!
  token: String!
}
Updated API Reference
Your updated API Reference should now look like this:

graphql
Copy code
type Query {
  recipes: [Recipe!]!
  recipe(recipeId: ID!): Recipe!
  searchRecipes(ingredients: [String!]!): [Recipe!]!
  popularRecipes(limit: Int!): [Recipe!]!
  profile: UserProfile!
}

type Mutation {
  submitRecipe(input: RecipeInput!): Recipe!
  updateRecipe(recipeId: ID!, input: RecipeInput!): Recipe!
  likeRecipe(recipeId: ID!): Recipe!
  deleteRecipe(recipeId: ID!): ID!
  register(input: RegisterInput!): User!
  login(input: LoginInput!): AuthPayload!
}

type Recipe {
  id: ID!
  title: String!
  description: String!
  ingredients: [String!]!
  instructions: [String!]!
  author: UserProfile!
  likes: Int!
  views: Int!
}

type UserProfile {
  id: ID!
  username: String!
  email: String!
  recipes: [Recipe!]!
}

input RecipeInput {
  title: String!
  description: String!
  ingredients: [String!]!
  instructions: [String!]!
}

input RegisterInput {
  username: String!
  email: String!
  password: String!
}

input LoginInput {
  email: String!
  password: String!
}

type AuthPayload {
  user: UserProfile!
  token: String!
}
```

## Authentication

To enable user-specific functionality like submitting recipes, you need to implement authentication using tokens, OAuth, or any other authentication mechanism of your choice.

## API Reference

The GraphQL API provides the following queries and mutations:

- `Query: recipes` - Retrieve a list of recipes.
- `Query: recipe` - Get details of a specific recipe by ID.
- `Query: searchRecipes` - Search for recipes based on ingredients.
- `Mutation: submitRecipe` - Submit a new recipe (requires authentication).

## Contributing

Contributions to this project are welcome! If you find any issues or want to add new features, feel free to submit a pull request.

- Fork the repository.
- Create a new branch for your feature or bug fix.
- Commit your changes and push the branch to your fork.
- Submit a pull request to the main repository.

## License

This project is licensed under the GPL-3.0 License. Feel free to use, modify, and distribute the code as per the terms of the license.

Copyright 2023, Max Base

Happy recipe sharing! 🍳🥗🍰
