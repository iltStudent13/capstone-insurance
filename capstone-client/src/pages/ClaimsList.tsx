import { useEffect, useState } from "react";
import api from "../services/api";
import Currency from "../components/Currency";
import { Link } from "react-router-dom";

export default function ClaimsList() {
  const [claims, setClaims] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [newClaim, setNewClaim] = useState({
    policy: "",
    description: "",
    amount: "",
    incidentDate: "",
    status: "submitted",
  });

  useEffect(() => {
    fetchClaims();
  }, [statusFilter, searchTerm, currentPage]);

  useEffect(() => {
    if (!isModalOpen) return;

    const loadPolicies = async () => {
      try {
        const response = await api.get("/policies");
        setPolicies(response.data?.policies ?? []);
      } catch (error) {
        console.error("Failed to fetch policy options:", error);
      }
    };

    loadPolicies();
  }, [isModalOpen]);

  const fetchClaims = async () => {
    try {
      const response = await api.get("/claims", {
        params: {
          status: statusFilter === "all" ? "" : statusFilter,
          search: searchTerm,
          page: currentPage,
        },
      });

      const payload = Array.isArray(response.data)
        ? response.data
        : (response.data.claims ?? []);

      setClaims(payload);
      setTotalPages(response.data.totalPages ?? 1);
    } catch (error) {
      console.error("Failed to fetch claims:", error);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handleNewClaimChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setNewClaim((current) => ({ ...current, [name]: value }));
  };

  const handleCreateClaim = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      const payload = {
        ...newClaim,
        amount: Number(newClaim.amount),
      };

      const response = await api.post("/claims", payload);
      setClaims((currentClaims) => [response.data, ...currentClaims]);
      setNewClaim({
        policy: "",
        description: "",
        amount: "",
        incidentDate: "",
        status: "submitted",
      });
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to create claim:", error);
      const message =
        error?.response?.data?.errors?.[0]?.msg ||
        error?.response?.data?.error ||
        "Unable to create claim right now.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1>Claims List</h1>
      <div className="policies-toolbar">
        <div className="policies-filter-group">
          <label className="policy-filter-label">
            Search
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Claim number or Policy Number"
              className="policy-filter-input"
            />
          </label>

          <label className="policy-filter-label">
            Status
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="policy-filter-select"
            >
              <option value="all">All</option>
              <option value="submitted">Submitted</option>
              <option value="under-review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="denied">Denied</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        <button type="button" onClick={() => setIsModalOpen(true)}>
          New Claim
        </button>
      </div>

      {isModalOpen && (
        <div
          className="policy-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="policy-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="policy-modal-header">
              <h2>New Claim</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleCreateClaim} className="policy-form">
              <div className="policy-form-grid">
                <label className="policy-form-field">
                  <span>Policy</span>
                  <select
                    name="policy"
                    value={newClaim.policy}
                    onChange={handleNewClaimChange}
                    required
                  >
                    <option value="">Select a policy</option>
                    {policies.map((policy: any) => (
                      <option
                        key={policy._id ?? policy.id}
                        value={policy._id ?? policy.id}
                      >
                        {policy.policyNumber}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="policy-form-field">
                  <span>Status</span>
                  <select
                    name="status"
                    value={newClaim.status}
                    onChange={handleNewClaimChange}
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under-review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>

                <label className="policy-form-field policy-form-field-full">
                  <span>Description</span>
                  <textarea
                    name="description"
                    value={newClaim.description}
                    onChange={handleNewClaimChange}
                    required
                  />
                </label>

                <label className="policy-form-field">
                  <span>Amount</span>
                  <input
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newClaim.amount}
                    onChange={handleNewClaimChange}
                    required
                  />
                </label>

                <label className="policy-form-field">
                  <span>Incident Date</span>
                  <input
                    name="incidentDate"
                    type="date"
                    value={newClaim.incidentDate}
                    onChange={handleNewClaimChange}
                    required
                  />
                </label>
              </div>

              <div className="policy-form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Claim"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="policies-table">
        <thead>
          <tr>
            <th>Claim Number</th>
            <th>Policy</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Incident Date</th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan={6}>No claims found.</td>
            </tr>
          ) : (
            claims.map((claim: any) => (
              <tr key={claim._id ?? claim.id}>
                <td>
                  <Link to={`/claims/${claim._id ?? claim.id}`}>
                    {claim.claimNumber}
                  </Link>
                </td>
                <td>
                  {claim.policyNumber ??
                    (typeof claim.policy === "string"
                      ? claim.policy
                      : (claim.policy?.policyNumber ?? "N/A"))}
                </td>
                <td>{claim.description}</td>
                <td>
                  <Currency amount={Number(claim.amount ?? 0)} />
                </td>
                <td>{claim.status}</td>
                <td>
                  {claim.incidentDate
                    ? new Date(claim.incidentDate).toLocaleDateString()
                    : "N/A"}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
