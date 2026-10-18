import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../utils/appError.js";

function extractToken(req) {
  return (
    req.cookies?.token ||
    req.headers.authorization?.replace("Bearer ", "") ||
    null
  );
}

export const protect = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) throw new AppError("Please log in to continue", 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Your session has expired, please log in again", 401);
  }

  req.user = await User.findById(payload.id);
  if (!req.user) throw new AppError("User no longer exists", 401);
  next();
});

export const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (user) req.user = user;
  } catch {
    // Silently ignore invalid token for optional routes
  }
  next();
});

export const allow =
  (...roles) =>
  (req, res, next) =>
    roles.includes(req.user.role)
      ? next()
      : next(new AppError("You do not have permission for this action", 403));