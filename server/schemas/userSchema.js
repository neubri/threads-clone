import { User } from "../models/User.js";

export const userTypeDefs = `#graphql
  type User {
    _id: ID
    name: String
    username: String
    email: String
    followers: [followers]
    following: [following]
  }

  type following {
    _id: ID
    name: String
    username: String
    email: String
  }

  type followers {
    _id: ID
    name: String
    username: String
    email: String
  }

  type Query {
    getUser: [User]
    getUserById(userId: ID) : User
    getUserByName(username: String) : [User]
    login(email: String, password: String): String
  }

  input RegisterInput {
    name: String
    username: String
    email: String
    password: String
  }

  input LoginInput {
    email: String
    password: String
  }

  type Mutation {
    register(newUser: RegisterInput): String
  }
`;

export const userResolvers = {
  Query: {
    login: async function (parents, args) {
      const { email, password } = args;
      const user = await User.login({ email, password });
      return user;
    },
    getUser: async function (parents, args, contextValue) {
      const context = await contextValue.auth();
      const user = await User.getUser();
      return user;
    },
    getUserById: async function (parents, args, contextValue) {
      const context = await contextValue.auth();
      const { userId } = args;
      const user = await User.getUserById(userId);
      return user;
    },
    getUserByName: async function (parents, args, contextValue) {
      const context = await contextValue.auth();
      const { username } = args;
      const user = await User.getUserByName(username);
      return user;
    },
  },
  Mutation: {
    register: async function (parents, args) {
      const { newUser } = args;
      const result = await User.register(newUser);
      return result;
    },
  },
};
