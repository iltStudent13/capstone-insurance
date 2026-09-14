import mongoose from "mongoose";
import * as Math from "mathjs";

const claimsSchema = new mongoose.Schema(
  {
    claimNumber: {
      type: String,
      unique: true,
      required: true,
    },
    policy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Policy",
    },
    description: {
      type: String,
      required: true,
    },
    incidentDate: {
      type: Date,
      required: true,
    },
    amount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ["submitted", "under-review", "approved", "denied", "closed"],
      default: "submitted",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    notes: [
      {
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        text: {
          type: String,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true },
);

// Generates a unique claim number before validation so required fields are present
claimsSchema.pre("validate", async function () {
  if (!this.claimNumber) {
    this.claimNumber = `CLM-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 10000)}`;
  }
});

const Claim = mongoose.model("Claim", claimsSchema);

export default Claim;
