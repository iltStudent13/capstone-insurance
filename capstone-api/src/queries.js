// This file contains mongo queries for the capstone API.  Query all users, a single policy, a single claim and the dashboard.
// Each function in this file will use the connectDB function to interact with the MongoDB database.
import connectDB from "./connectDB";

const getAllUsers = async () => {
  const db = await connectDB();
  return db.collection("users").find().toArray();
};

const getPolicyById = async (policyId) => {
  const db = await connectDB();
  return db.collection("policies").findOne({ _id: new ObjectId(policyId) });
};

const getClaimById = async (claimId) => {
  const db = await connectDB();
  return db.collection("claims").findOne({ _id: new ObjectId(claimId) });
};

const getDashboardData = async () => {
  const db = await connectDB();
  const usersCount = await db.collection("users").countDocuments();
  const policiesCount = await db.collection("policies").countDocuments();
  const claimsCount = await db.collection("claims").countDocuments();
  return { usersCount, policiesCount, claimsCount };
};

export { getAllUsers, getPolicyById, getClaimById, getDashboardData };
