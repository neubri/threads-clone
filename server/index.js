import "dotenv/config";
import { ApolloServer } from "@apollo/server";
import { verifyToken } from "./utils/jwt.js";
import { startStandaloneServer } from "@apollo/server/standalone";
import { userResolvers, userTypeDefs } from "./schemas/userSchema.js";
import { postResolvers, postTypeDefs } from "./schemas/postSchema.js";
import { followResolvers, followTypeDefs } from "./schemas/followSchema.js";

const server = new ApolloServer({
  typeDefs: [userTypeDefs, postTypeDefs, followTypeDefs],
  resolvers: [userResolvers, postResolvers, followResolvers],
  introspection: true,
});

const { url } = await startStandaloneServer(server, {
  listen: { port: process.env.PORT },
  context: async function ({ req, res }) {
    const auth = function () {
      if (!req.headers.authorization) {
        throw new Error("Invalid token");
      }

      const rawToken = req.headers.authorization.split(" ");
      const tokenType = rawToken[0];
      const tokenValue = rawToken[1];

      if (tokenType !== "Bearer" || !tokenValue) {
        throw new Error("Unauthorized");
      }

      const user = verifyToken(tokenValue);

      return user;
    };

    return {
      auth,
    };
  },
});

console.log(` 🚀 Server running on: ${url}`);
