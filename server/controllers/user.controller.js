import generateToken from "../config/token.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

import {
  recordSuccessfulLogin,
  recordFailedLogin,
  recordUserRegistration,
  recordUserLogout,
} from "../metrics/authMetrics.js";

import { recordDatabaseQuery } from "../metrics/dbMetrics.js";

// ============================================================
// User Registration Controller
// ============================================================

export const signUp = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Database Query
    recordDatabaseQuery();

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password length must be 6 or more",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Database Query
    recordDatabaseQuery();

    await newUser.save();

    const authToken = await generateToken(newUser._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });

    // Prometheus Metric
    recordUserRegistration();

    res.status(201).json({
      message: "Signup success",
    });

  } catch (error) {

    console.error("Signup error:", error.message);

    res.status(500).json({
      message: "Server issue",
    });

  }
};

// ============================================================
// User Login Controller
// ============================================================

export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Database Query
    recordDatabaseQuery();

    const existingUser = await User.findOne({ email });

    if (!existingUser) {

      recordFailedLogin();

      return res.status(400).json({
        message: "User not found",
      });
    }

    const match = await bcrypt.compare(password, existingUser.password);

    if (!match) {

      recordFailedLogin();

      return res.status(400).json({
        message: "Wrong credentials",
      });
    }

    const authToken = await generateToken(existingUser._id);

    res.cookie("token", authToken, {
      httpOnly: true,
      maxAge: 10 * 24 * 60 * 60 * 1000,
      sameSite: "strict",
      secure: false,
    });

    // Prometheus Metric
    recordSuccessfulLogin();

    res.status(200).json({
      message: "Signin success",
    });

  } catch (error) {

    console.error("Signin error:", error.message);

    recordFailedLogin();

    res.status(500).json({
      message: "Server issue",
    });

  }
};

// ============================================================
// User Logout Controller
// ============================================================

export const signOut = async (req, res) => {
  try {

    // Prometheus Metric
    recordUserLogout();

    res.clearCookie("token");

    res.status(200).json({
      message: "Logout success",
    });

  } catch (error) {

    res.status(500).json({
      message: "Server issue",
    });

  }
};