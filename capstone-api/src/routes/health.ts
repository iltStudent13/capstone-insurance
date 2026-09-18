import express from "express";
import authenticate from "../middleware/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
  });
});

export default router;
