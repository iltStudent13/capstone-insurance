import express from "express";
import "dotenv/config";
import cors from "cors";
import authRouter from "./routes/auth.js";
import claimRouter from "./routes/claim.js";
import policyRouter from "./routes/policy.js";
import dashboardRouter from "./routes/dashboard.js";
import { connectDB } from "./config/db.js";
import errorHandler from "./middleware/error.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/claims", claimRouter);
app.use("/api/policies", policyRouter);
app.use("/api/dashboard", dashboardRouter);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
connectDB(process.env.MONGODB_URI || "mongodb://localhost:27017/capstone")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to the database", err);
  });
