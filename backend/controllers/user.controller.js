import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";

// Set cookies
const setSessionCookie = (req, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "30d" });

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Name, email and password are required.",
    });
  }

  const trimmedEmail = email.toLowerCase().trim();
  const isExistingUser = await userModel.findOne({ email: trimmedEmail });

  if (isExistingUser) {
    return res.status(400).json({
      error: "User already exists. Please login.",
    });
  }

  const user = await userModel.create({
    name,
    email: trimmedEmail,
    password,
  });

  setSessionCookie(res, { userId: user._id.toString(), email: user.email });

  return res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "Email and password are required.",
    });
  }

  const userExists = await userModel.findOne({
    email: email.toLowerCase().trim(),
  });

  if (!userExists) {
    return res.status(401).json({
      error: "User does not exist. Please register.",
    });
  }

  const isPasswordValid = await userExists.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      error: "Invalid email or password.",
    });
  }

  setSessionCookie(res, { userId: user._id.toString(), email: user.email });

  return res.status(200).json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
  });
};

export const logout = async (_req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return res.status(200).json({
    success: true,
  });
};

export const me = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      error: "User not authenticated.",
    });
  }

  const user = await userModel.findById(req.user.userId).select("-password");

  if (!user) {
    return res.status(404).json({
      error: "User not found.",
    });
  }

  return res.status(200).json({
    user,
  });
};