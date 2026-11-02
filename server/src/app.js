import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/authRoutes.js";
import homeRoutes from "./routes/homeRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { razorpayWebhook } from "./controllers/bookingController.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import { errorHandler, notFound } from "./middleware/error.js";
import hostRoutes from "./routes/hostRoutes.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, "..", "uploads");

const app = express();
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(
  cors({
    origin: process.env.CLIENT_URL?.split(",") || "http://localhost:3000",
    credentials: true,
  }),
);

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  razorpayWebhook,
);

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));

// Serve uploaded images
app.use("/uploads", express.static(uploadsPath));

app.get("/api/health", (req, res) =>
  res.json({ ok: true, service: "Roamly-api" }),
);

app.use(
  "/api/auth",
  rateLimit({ windowMs: 15 * 60 * 1000, limit: 100 }),
  authRoutes,
);

app.use("/api/homes", homeRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/host", hostRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
