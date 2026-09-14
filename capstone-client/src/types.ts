export type User = { _id: string; name: string; email: string; role: string };

export type Policy = {
  _id: string;
  holderName: string;
  policyNumber: string;
  type: string;
  premium: number;
  status: string;
  effectiveDate: Date;
  expirationDate: Date;
  owner: User | string;
};

export type Claim = {
  _id: string;
  claimNumber: string;
  description: string;
  incidentDate: Date;
  status: string;
  amount: number;
  policy: Policy | string;
  assignedTo: User | string;
  notes: Array<{
    _id: string;
    content: string;
    createdAt: Date;
    createdBy: User | string;
  }>;
};

export type DashboardStats = {
  totalPolicies: number;
  totalClaims: number;
  totalUsers: number;
  claimsByStatus: Record<string, number>;
  policiesByType: Record<string, number>;
  recentClaims: Claim[];
  totalClaimAmount: number;
};
