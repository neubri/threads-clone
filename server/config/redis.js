import Redis from "ioredis";

const redis = new Redis(
  process.env.REDIST_DATABASE_URI || "redis://localhost:6379"
);

export default redis;
