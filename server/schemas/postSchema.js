import { Post } from "../models/Post.js";
import redis from "../config/redis.js";

export const postTypeDefs = `#graphql
  type Post {
    _id: ID
    content: String
    tags: [String]
    imgUrl: String
    authorId: ID
    authorDetails: User
    comments: [Comment]
    likes: [Like]
    createdAt: String
    updatedAt: String
  }

  type User {
    name: String
    username: String
    email: String
  }

  type Comment {
    content: String
    username: String
    createdAt: String
    updatedAt: String
  }


  type Like {
    username: String
    createdAt: String
    updatedAt: String
  }

  type Query {
    getPosts: [Post]
    getPostById(postId: ID) : Post
  }

  type Mutation {
    createPost(content: String, tags: [String], imgUrl: String) : Post
    addComment(content: String, _id: ID) : Comment
    addLike(_id: ID) : Like
  }
`;

export const postResolvers = {
  Query: {
    getPosts: async function (parents, args, contextValue) {
      const context = await contextValue.auth();

      const userChached = await redis.get("posts");

      if (userChached) {
        const userParsed = JSON.parse(userChached);
        return userParsed;
      }

      const posts = await Post.getPosts();

      await redis.set("posts", JSON.stringify(posts));

      return posts;
    },
    getPostById: async function (parents, args, contextValue) {
      const context = await contextValue.auth();

      const { postId } = args;

      const post = await Post.getPostById(postId);

      return post;
    },
  },
  Mutation: {
    createPost: async function (parents, args, contextValue) {
      const { content, tags, imgUrl } = args;

      //ambil dari header
      const context = await contextValue.auth();

      //masukin id nya ke authorId
      const authorId = context.id;

      const newPost = await Post.createPost(content, tags, imgUrl, authorId);

      await redis.del("posts");

      return newPost;
    },
    addComment: async function (parents, args, contextValue) {
      const context = await contextValue.auth();

      const { content, _id } = args;

      const username = context.username;

      const newComment = await Post.addComment(content, _id, username);

      return newComment;
    },
    addLike: async function (parents, args, contextValue) {
      const context = await contextValue.auth();

      const { _id } = args;

      const username = context.username;

      const newLike = await Post.addLike(_id, username);

      return newLike;
    },
  },
};
