import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_DATABASE_URI || "mongodb://localhost:27017";

export const client = new MongoClient(uri);

let db = null;

function connect() {
  try {
    db = client.db(process.env.MONGODB_DATABASE_NAME || "threads-db");

    return db;
  } catch (error) {
    console.log("Can not connected to mongodb database");
  }
}

export function getDB() {
  if (!db) return connect();

  return db;
}
