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

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
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
