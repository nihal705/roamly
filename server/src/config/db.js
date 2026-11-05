import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

  const options = {
    maxPoolSize: 10,
    minPoolSize: 0, // Allow pool to drop to 0 idle connections so heartbeats don't keep Railway awake
    maxIdleTimeMS: 10000, // Close idle sockets after 10 seconds of no requests
    socketTimeoutMS: 45000,
    serverSelectionTimeoutMS: 30000,
  };

  try {
    await mongoose.connect(process.env.MONGODB_URI, options);
    console.log("MongoDB connected with resilient pool settings.");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
}