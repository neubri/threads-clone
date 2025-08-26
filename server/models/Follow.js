import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";

export class Follow {
  static getCollection() {
    const db = getDB();
    const collection = db.collection("follows");

    return collection;
  }

  static async followUser(followerId, followingId) {
    const collection = this.getCollection();

    if (!followingId) {
      throw new Error("FollowingId is required");
    }

    if (!followerId) {
      throw new Error("FollowerId is required");
    }

    // Convert ke ObjectId
    const followerObjectId = new ObjectId(followerId);
    const followingObjectId = new ObjectId(followingId);

    if (followerId === followingId) {
      throw new Error("Can't follow yourself");
    }

    //cel user yang difollow ada engga
    const userCollection = getDB().collection("users");
    const user = await userCollection.findOne({
      _id: followingObjectId,
    });

    if (!user) {
      throw new Error("User not found");
    }

    //cek user nya udah follow yg mau di follow belum
    const alreadyFollowing = await collection.findOne({
      followerId: followerObjectId,
      followingId: followingObjectId,
    });

    if (alreadyFollowing) {
      throw new Error("You already follow this user");
    }

    //insert follow baru
    const result = await collection.insertOne({
      followerId: followerObjectId,
      followingId: followingObjectId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const follow = await collection.findOne({
      _id: result.insertedId,
    });

    return follow;
  }
}
