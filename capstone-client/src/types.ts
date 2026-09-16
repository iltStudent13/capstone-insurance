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
  policyNumber: Policy | string;
  assignedTo: User | string;
  notes: Array<{
    _id: string;
    author?: User | string;
    createdBy?: User | string;
    text?: string;
    content?: string;
    createdAt: Date;
  }>;
};

export type DashboardData = {
  totalClaims: number;
  totalPolicies: number;
  totalUsers: number;
  totalClaimAmount: number;
  claimsByStatus: Record<string, number>;
  recentClaims: Array<{
    _id: string;
    claimNumber?: string;
    policyNumber?: string | null;
    status?: string;
    amount?: number;
  }>;
};

export type RecentClaim = {
  _id: string;
  id?: string;
  claimNumber?: string;
  policyNumber?: string | null;
  status?: string;
  amount?: number;
};

export type AuthContextValue = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<void>;
  logout: () => void;
};
