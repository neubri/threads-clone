import { getDB } from "../config/mongodb.js";
import { ObjectId } from "mongodb";

export class Post {
  static getCollection() {
    const db = getDB();
    const collection = db.collection("posts");

    return collection;
  }

  static async createPost(content, tags, imgUrl, authorId) {
    const collection = this.getCollection();

    if (!content) {
      throw new Error("Content is required");
    }

    if (!authorId) {
      throw new Error("AuthorId is required");
    }

    if (!tags) {
      tags = [];
    }

    const result = await collection.insertOne({
      content,
      tags,
      imgUrl,
      authorId: new ObjectId(authorId), // Convert ke ObjectId
      comments: [],
      likes: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const post = await collection.findOne({
      _id: result.insertedId,
    });

    return post;
  }

  static async getPosts() {
    const collection = this.getCollection();

    const posts = await collection
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails",
          },
        },
        {
          $unwind: {
            path: "$authorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        { $project: { "authorDetails.password": 0 } },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return posts;
  }

  static async getPostById(id) {
    const collection = this.getCollection();

    if (!id) {
      throw new Error("PostId is required");
    }

    const postId = new ObjectId(id);

    const post = await collection
      .aggregate([
        {
          $match: { _id: postId },
        },
        {
          $lookup: {
            from: "users",
            localField: "authorId",
            foreignField: "_id",
            as: "authorDetails",
          },
        },
        {
          $unwind: {
            path: "$authorDetails",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            "authorDetails.password": false,
          },
        },
      ])
      .toArray();

    return post[0];
  }

  static async addComment(content, _id, username) {
    const collection = this.getCollection();

    if (!content) {
      throw new Error("Content is required");
    }
    if (!username) {
      throw new Error("Username is required");
    }
    if (!_id) {
      throw new Error("PostId is required");
    }

    const comment = await collection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $push: {
          comments: {
            content,
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    //cek post nya ada apa engga
    if (!comment) {
      throw new Error("Post not found");
    }

    //return comment terakhir (yg baru di add)
    return comment.comments[comment.comments.length - 1];
  }

  static async addLike(_id, username) {
    const collection = this.getCollection();

    if (!username) {
      throw new Error("Username is required");
    }
    if (!_id) {
      throw new Error("PostId is required");
    }

    const like = await collection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      {
        $push: {
          likes: {
            username,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: "after" }
    );

    if (!like) {
      throw new Error("Post not found");
    }

    return like.likes[like.likes.length - 1];
  }
}
