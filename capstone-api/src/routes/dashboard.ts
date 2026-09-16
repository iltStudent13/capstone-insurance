import express from "express";
const router = express.Router();
import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
import User from "../models/User.js";

router.get("/", async (req, res, next) => {
  try {
    const [
      totalClaims,
      claimsByStatus,
      totalPolicies,
      policiesByType,
      totalUsers,
      recentClaims,
      totalClaimAmount,
    ] = await Promise.all([
      Claim.countDocuments(),
      Claim.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Policy.countDocuments(),
      Policy.aggregate([{ $group: { _id: "$type", count: { $sum: 1 } } }]),
      User.countDocuments(),
      Claim.find()
        .populate("policy", "policyNumber")
        .sort({ createdAt: -1 })
        .limit(5),
      Claim.aggregate([
        { $group: { _id: null, totalAmount: { $sum: "$amount" } } },
      ]),
    ]);

    const dashboardData = {
      totalClaims,
      claimsByStatus: claimsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalPolicies,
      policiesByType: policiesByType.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      totalUsers,
      recentClaims: recentClaims.map((claim: any) => ({
        ...claim.toObject(),
        policyNumber: claim.policy?.policyNumber ?? null,
      })),
      totalClaimAmount:
        totalClaimAmount.length > 0 ? totalClaimAmount[0].totalAmount : 0,
    };
    res.json(dashboardData);
  } catch (error) {
    next(error);
  }
});

export default router;
