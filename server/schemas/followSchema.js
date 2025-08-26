import { Follow } from "../models/Follow.js";

export const followTypeDefs = `#graphql
  type Follow {
    followingId: ID
    followerId: ID
    createdAt: String
    updatedAt: String
  }

  type Mutation {
    followUser(followingId: ID) : Follow
  }
`;

export const followResolvers = {
  Mutation: {
    followUser: async function (parents, args, contextValue) {
      const context = await contextValue.auth();

      const followerId = context.id;

      const { followingId } = args;

      const result = await Follow.followUser(followerId, followingId);

      return result;
    },
  },
};
