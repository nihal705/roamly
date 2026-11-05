import mongoose from "mongoose";

let isConnecting = null;
let idleTimer = null;
const IDLE_DISCONNECT_MS = 30000; // 30 seconds of inactivity disconnects Mongoose so Railway can sleep

export async function connectDatabase() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;
  if (isConnecting) return isConnecting;

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required");

  const options = {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 10000,
  };

  isConnecting = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, options);
      console.log("MongoDB connected.");
      return mongoose.connection;
    } catch (err) {
      console.error("MongoDB connection error:", err);
      throw err;
    } finally {
      isConnecting = null;
    }
  })();

  return isConnecting;
}

export function resetDbIdleTimer() {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (mongoose.connection.readyState === 1) {
      console.log("Closing idle DB connection so Railway can enter Serverless Sleep...");
      try {
        await mongoose.disconnect();
      } catch (err) {
        console.error("Error closing idle DB connection:", err);
      }
    }
  }, IDLE_DISCONNECT_MS);
}