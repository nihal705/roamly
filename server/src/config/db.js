import mongoose from "mongoose";

export async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

  const options = {
    maxPoolSize: 10, 
    minPoolSize: 1,  
    maxIdleTimeMS: 30000, 
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