import "express-serve-static-core";
import type { Types } from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user: {
      _id: Types.ObjectId;
      name: string;
      email: string;
      role: "adjuster" | "admin";
    };
  }
}

export {};
