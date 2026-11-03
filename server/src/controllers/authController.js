import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError, asyncHandler } from "../utils/appError.js";

function sendToken(user, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined,
    maxAge: 604800000,
    path: "/",
  });
  res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
}

export const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role = "guest" } = req.body;
  if (!name || !email || !password)
    throw new AppError("Name, email and password are required");
  if (password.length < 8)
    throw new AppError("Password must have at least 8 characters");
  if (await User.exists({ email }))
    throw new AppError("This email is already registered", 409);
  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 12),
    role: role === "host" ? "host" : "guest",
  });
  sendToken(user, res);
});

export const login = asyncHandler(async (req, res) => {
  const user = await User.findOne({
    email: req.body.email?.toLowerCase(),
  }).select("+password");
  if (!user || !(await bcrypt.compare(req.body.password || "", user.password)))
    throw new AppError("Incorrect email or password", 401);
  sendToken(user, res);
});

export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    domain: process.env.COOKIE_DOMAIN || undefined,
    path: "/",
  });
  res.status(204).send();
};

export const me = (req, res) => {
  if (!req.user) {
    return res.json({ user: null });
  }
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
};
