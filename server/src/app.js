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
import { connectDatabase, resetDbIdleTimer } from "./config/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsPath = path.join(__dirname, "..", "uploads");

const app = express();
app.set("trust proxy", 1);
app.use(helmet({ crossOriginResourcePolicy: false }));

const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);

      const isAllowed =
        allowedOrigins.includes(origin) ||
        origin === "https://roamly.gnihal.com" ||
        /^https:\/\/([a-z0-9\-_]+\.)?gnihal\.com$/.test(origin) ||
        /^https:\/\/roamly[a-z0-9\-_]*\.vercel\.app$/.test(origin) ||
        origin === "http://localhost:3000";

      if (isAllowed) {
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

// Auto-connect Mongoose on incoming request and schedule idle disconnect for Serverless Sleep
app.use(async (req, res, next) => {
  try {
    await connectDatabase();
    resetDbIdleTimer();
    res.on("finish", () => resetDbIdleTimer());
    next();
  } catch (err) {
    next(err);
  }
});

app.use(
  "/api/auth",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    validate: false,
  }),
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
