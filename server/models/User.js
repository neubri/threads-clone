import { ObjectId } from "mongodb";
import { getDB } from "../config/mongodb.js";
import { comparePassword, hashPassword } from "../utils/bcrypt.js";
import { signToken } from "../utils/jwt.js";
import validator from "email-validator";

export class User {
  static getCollection() {
    const db = getDB();
    const collection = db.collection("users");

    return collection;
  }

  static async register(payload) {
    const collection = this.getCollection();

    const { username, email, password } = payload;

    if (!username) {
      throw new Error("Username is required");
    }

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    //validasi panjang pass
    if (password.length < 5) {
      throw new Error("Password must be at least 5 character");
    }

    //validasi email format
    if (!validator.validate(email)) {
      throw new Error("Invalid email format");
    }

    // Cek email sudah ada atau belum
    const emailExists = await collection.findOne({ email });
    if (emailExists) {
      throw new Error("Email is already exist");
    }

    // Cek username sudah ada atau belum
    const usernameExists = await collection.findOne({ username });
    if (usernameExists) {
      throw new Error("Username is already exist");
    }

    const result = await collection.insertOne({
      ...payload,
      password: hashPassword(payload.password),
    });

    return "Register success";
  }

  static async login(payload) {
    const collection = this.getCollection();

    const { email, password } = payload;

    if (!email) {
      throw new Error("Email is required");
    }

    if (!password) {
      throw new Error("Password is required");
    }

    // Cari user berdasarkan email
    const user = await collection.findOne({ email });
    if (!user) {
      throw new Error("Invalid email/password");
    }

    // Bandingkan password
    const isPasswordValid = comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid email/password");
    }

    // Kemabalikan token nya brayy
    const access_token = signToken({
      id: user._id.toString(),
      email: user.email,
      username: user.username,
    });

    return access_token;
  }

  static async getUser() {
    const collection = this.getCollection();

    const user = await collection.find().toArray();

    return user;
  }

  static async getUserById(id) {
    const collection = this.getCollection();

    if (!id) {
      throw new Error("UserId is required");
    }

    const userId = new ObjectId(id);

    const user = await collection
      .aggregate([
        {
          $match: {
            _id: userId,
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followerId",
            as: "followingData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followingData.followingId",
            foreignField: "_id",
            as: "following",
          },
        },
        {
          $lookup: {
            from: "follows",
            localField: "_id",
            foreignField: "followingId",
            as: "followerData",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "followerData.followerId",
            foreignField: "_id",
            as: "followers",
          },
        },
        {
          $project: {
            password: 0,
            followingData: 0,
            followerData: 0,
          },
        },
      ])
      .toArray();

    return user[0];
  }

  static async getUserByName(username) {
    const collection = this.getCollection();

    if (!username) {
      throw new Error("Username is required");
    }

    let user = await collection
      .find({
        username: { $regex: username, $options: "i" },
      })
      .toArray();

    return user;
  }
}
