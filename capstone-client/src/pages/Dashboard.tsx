import { useEffect, useState } from "react";
import api from "../services/api";
import Currency from "../components/Currency";
import { Link } from "react-router-dom";
import { type DashboardData, type RecentClaim } from "../types";

export default function Dashboard() {
  const [d, setD] = useState<DashboardData | null>(null);

  useEffect(() => {
    api.get("/dashboard").then((r) => setD(r.data as DashboardData));
  }, []);

  if (!d) return <p>Loading dashboard...</p>;
  return (
    <>
      <h2>Dashboard</h2>
      <section className="cards">
        <article>
          <span>Total Claims</span>
          <b>{d.totalClaims}</b>
        </article>
        <article>
          <span>Total Policies</span>
          <b>{d.totalPolicies}</b>
        </article>
        <article>
          <span>Total Users</span>
          <b>{d.totalUsers}</b>
        </article>
        <article>
          <span>Total Claim Amount</span>
          <b>
            <Currency amount={d.totalClaimAmount} className="currency-value" />
          </b>
        </article>
      </section>
      <div className="dashboard-layout">
        <div className="dashboard-left">
          <h3>Claims by Status</h3>
          <div className="bar-chart">
            {(Object.entries(d.claimsByStatus ?? {}) as [string, number][])
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const percentage =
                  d.totalClaims > 0 ? (count / d.totalClaims) * 100 : 0;
                return (
                  <div className="bar-row" key={status}>
                    <div className="bar-label">{status}</div>
                    <div className="bar-track" aria-hidden>
                      <div
                        className="bar-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="count">{count}</div>
                  </div>
                );
              })}
          </div>
        </div>

        <div className="dashboard-right">
          <h3>Recent Claims</h3>
          {(d.recentClaims ?? []).length === 0 && (
            <p>No recent claims available.</p>
          )}
          <table>
            <thead>
              <tr>
                <th>Claim #</th>
                <th>Policy</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {(d.recentClaims ?? []).map((claim: RecentClaim) => (
                <tr key={claim._id ?? claim.id}>
                  <td>
                    <Link to={`/claims/${claim._id ?? claim.id}`}>
                      {claim.claimNumber}
                    </Link>
                  </td>
                  <td>{claim.policyNumber}</td>
                  <td>{claim.status}</td>
                  <td>
                    <Currency amount={claim.amount ?? 0} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
