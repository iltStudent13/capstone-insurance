import mongoose from "mongoose";

const policySchema = new mongoose.Schema({
  policyNumber: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  holderName: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["auto", "home", "life"],
    required: true,
  },
  premium: {
    type: Number,
    min: 0,
  },
  status: {
    type: String,
    enum: ["active", "expired", "cancelled"],
    default: "active",
  },
  effectiveDate: {
    type: Date,
    default: new Date().toISOString().split("T")[0],
  },
  expirationDate: {
    type: Date,
    default: function () {
      const effectiveDate = this.effectiveDate || new Date();
      const expirationDate = new Date(effectiveDate);
      expirationDate.setFullYear(expirationDate.getFullYear() + 1);
      return expirationDate.toISOString().split("T")[0];
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate a policy number before validation so required fields are present
policySchema.pre("validate", async function () {
  if (!this.policyNumber) {
    this.policyNumber = `POL-${this.type}-${Math.floor(Math.random() * 1000)}`;
  }
});

const Policy = mongoose.model("Policy", policySchema);

export default Policy;
