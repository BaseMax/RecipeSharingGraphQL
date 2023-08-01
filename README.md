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
git clone https://github.com/BaseMax/RecipeSharingGraphQL
cd RecipeSharingGraphQL
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

This query returns a list of popular recipes based on the number of likes.

```graphql
type Query {
  popularRecipes(limit: Int!): [Recipe!]!
}
```

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
  name: String!
  token: String!
}
```

**Recent Recipes Query:**

This query returns a list of recently added recipes.

```graphql
type Query {
  recentRecipes(limit: Int!): [Recipe!]!
}
```

**Top Authors Query:**

This query returns a list of top authors based on their total recipes.

```graphql
type Query {
  topAuthors(limit: Int!): [UserProfile!]!
}
```

**Random Recipe Query:**

This query returns a random recipe from the platform.

```graphql
type Query {
  randomRecipe: Recipe!
}
```

**Add Comment Mutation:**

This mutation allows users to add comments to a recipe.

```graphql
type Mutation {
  addComment(recipeId: ID!, text: String!): Comment!
}

type Comment {
  id: ID!
  text: String!
  author: UserProfile!
  createdAt: String!
}
```

**Update Comment Mutation:**

This mutation allows users to update their own comments.

```graphql
type Mutation {
  updateComment(commentId: ID!, text: String!): Comment!
}
```

**Delete Comment Mutation:**

This mutation allows users to delete their own comments.

```graphql
type Mutation {
  deleteComment(commentId: ID!): ID!
}
```

**Toggle Like Comment Mutation:**

This mutation allows users to like or unlike a comment.

```graphql
type Mutation {
  toggleLikeComment(commentId: ID!): Comment!
}
```

**Toggle Follow User Mutation:**

This mutation allows users to follow or unfollow other users.

```graphql
type Mutation {
  toggleFollowUser(userId: ID!): UserProfile!
}
```

**User Recipes Query:**

This query allows users to retrieve their own submitted recipes.

```graphql
type Query {
  userRecipes: [Recipe!]!
}
```

**Recommended Recipes Query:**

This query returns a list of recommended recipes based on the user's liked recipes and followed authors.

```graphql
type Query {
  recommendedRecipes(limit: Int!): [Recipe!]!
}
```

**Rate Recipe Mutation:**

This mutation allows users to rate a recipe on a scale from 1 to 5.

```graphql
type Mutation {
  rateRecipe(recipeId: ID!, rating: Int!): Recipe!
}
```

**Report Recipe Mutation:**

This mutation allows users to report a recipe for inappropriate content.

```graphql
type Mutation {
  reportRecipe(recipeId: ID!, reason: String!): Recipe!
}
```

**Update Profile Mutation:**

This mutation allows users to update their profile information.

```graphql
type Mutation {
  updateProfile(input: UpdateProfileInput!): UserProfile!
}

input UpdateProfileInput {
  username: String
  email: String
  password: String
}
```

**Updated API Reference**

```graphql
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

The GraphQL API provides the following queries and mutations.

### Queries:

- `recipes`: Retrieve a list of recipes.
- `recipe`: Get details of a specific recipe by ID.
- `searchRecipes`: Search for recipes based on ingredients.
- `popularRecipes`: Retrieve a list of popular recipes based on the number of likes and views.
- `recentRecipes`: Retrieve a list of recently added recipes.
- `topAuthors`: Retrieve a list of top authors based on their total likes and contributions.
- `randomRecipe`: Get a random recipe from the platform.
- `profile`: Retrieve the user's profile information.
- `userRecipes`: Retrieve a list of recipes submitted by the authenticated user.
- `recommendedRecipes`: Retrieve a list of recommended recipes based on the user's liked recipes and followed authors.

### Mutations:

- `submitRecipe`: Submit a new recipe (requires authentication).
- `updateRecipe`: Update a recipe (requires authentication and ownership).
- `likeRecipe`: Like a recipe.
- `deleteRecipe`: Delete a recipe (requires authentication and ownership).
- `addComment`: Add a comment to a recipe (requires authentication).
- `updateComment`: Update a comment (requires authentication and ownership).

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
