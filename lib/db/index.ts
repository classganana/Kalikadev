/**
 * MongoDB connection utility using Mongoose.
 *
 * Uses a singleton pattern to prevent multiple connections during Next.js
 * hot reloading in development. Mongoose buffers commands when disconnected.
 */
import mongoose from "mongoose";

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined. Add it to .env.local");
  }
  return uri;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as { mongoose: MongooseCache };

const cached = globalForMongoose.mongoose ?? { conn: null, promise: null };

if (process.env.NODE_ENV !== "production") {
  globalForMongoose.mongoose = cached;
}

/**
 * Connect to MongoDB. Call this in API routes or server components
 * that need database access. Connection is reused across requests.
 */
export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(getMongoUri(), {
      bufferCommands: true,
      maxPoolSize: 10,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
