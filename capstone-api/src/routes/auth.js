import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import authenticate from "../middleware/auth.js";
import {
  validateRegistration,
  validateLogin,
  handleValidationErrors,
} from "../middleware/validate.js";

const router = express.Router();

// Register a new user
router.post(
  "/register",
  validateRegistration,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { name, email, password, role } = req.body;
      const user = new User({ name, email, password, role });
      await user.save();
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });
      res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

// Login a user and return a JWT token
router.post(
  "/login",
  validateLogin,
  handleValidationErrors,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      // Find user and explicitly include password
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ error: "Invalid email or password" });
      }

      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      res.json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },
);

router.get("/me", authenticate, (req, res) => {
  res.json({
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
    },
  });
});

export default router;
