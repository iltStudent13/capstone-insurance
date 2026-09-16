import api from "../services/api";
import { useEffect, useState } from "react";
import Currency from "../components/Currency";
import { useAuth } from "../context/AuthContext";

export default function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    holderName: "",
    type: "auto",
    premium: "1000",
    status: "active",
    effectiveDate: new Date().toISOString().split("T")[0],
    expirationDate: new Date(
      new Date().setFullYear(new Date().getFullYear() + 1),
    )
      .toISOString()
      .split("T")[0],
  });

  const fetchPolicies = async (
    nextType = typeFilter,
    nextSearch = searchTerm,
  ) => {
    try {
      const params: Record<string, string> = {};
      if (nextType && nextType !== "all") params.type = nextType;
      if (nextSearch.trim()) params.search = nextSearch.trim();

      const response = await api.get("/policies", { params });
      setPolicies(response.data?.policies ?? []);
    } catch (error) {
      console.error("Failed to fetch policies:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
    fetchPolicies(value, searchTerm);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    fetchPolicies(typeFilter, value);
  };

  const handleFormChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormData((current) => {
      const nextState = { ...current, [name]: value };

      if (name === "effectiveDate" && value) {
        const date = new Date(value);
        date.setFullYear(date.getFullYear() + 1);
        nextState.expirationDate = date.toISOString().split("T")[0];
      }

      return nextState;
    });
  };

  const handleCreatePolicy = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (user?.role !== "admin") {
      alert("Only admins can create policies.");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        premium: Number(formData.premium),
      };

      const response = await api.post("/policies", payload);
      setPolicies((currentPolicies) => [response.data, ...currentPolicies]);
      setIsModalOpen(false);
      setFormData({
        holderName: "",
        type: "auto",
        premium: "1000",
        status: "active",
        effectiveDate: new Date().toISOString().split("T")[0],
        expirationDate: new Date(
          new Date().setFullYear(new Date().getFullYear() + 1),
        )
          .toISOString()
          .split("T")[0],
      });
    } catch (error: any) {
      console.error("Failed to create policy:", error);
      const message =
        error?.response?.status === 403
          ? "Only admins can create policies."
          : error?.response?.data?.errors?.[0]?.msg ||
            error?.response?.data?.error ||
            "Unable to create policy right now.";
      alert(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Policies</h1>
      <div className="policies-toolbar">
        <div className="policies-filter-group">
          <label className="policy-filter-label">
            Search
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Policy number or holder"
              className="policy-filter-input"
            />
          </label>

          <label className="policy-filter-label">
            Type
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="policy-filter-select"
            >
              <option value="all">All</option>
              <option value="auto">Auto</option>
              <option value="home">Home</option>
              <option value="life">Life</option>
            </select>
          </label>
        </div>

        {user?.role === "admin" && (
          <button type="button" onClick={() => setIsModalOpen(true)}>
            New Policy
          </button>
        )}
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
              <h2>New Policy</h2>
              <button type="button" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <form onSubmit={handleCreatePolicy} className="policy-form">
              <div className="policy-form-grid">
                <label className="policy-form-field">
                  <span>Type</span>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleFormChange}
                  >
                    <option value="auto">Auto</option>
                    <option value="home">Home</option>
                    <option value="life">Life</option>
                  </select>
                </label>

                <label className="policy-form-field">
                  <span>Status</span>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                  >
                    <option value="active">Active</option>
                    <option value="expired">Expired</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="policy-form-field policy-form-field-full">
                  <span>Holder Name</span>
                  <input
                    name="holderName"
                    type="text"
                    value={formData.holderName}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label className="policy-form-field">
                  <span>Premium</span>
                  <input
                    name="premium"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.premium}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label className="policy-form-field">
                  <span>Effective Date</span>
                  <input
                    name="effectiveDate"
                    type="date"
                    value={formData.effectiveDate}
                    onChange={handleFormChange}
                    required
                  />
                </label>

                <label className="policy-form-field">
                  <span>Expiration Date</span>
                  <input
                    name="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={handleFormChange}
                    required
                  />
                </label>
              </div>

              <div className="policy-form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting}>
                  {submitting ? "Saving..." : "Create Policy"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="policies-table">
        <thead>
          <tr>
            <th>Policy Number</th>
            <th>Holder</th>
            <th>Type</th>
            <th>Premium</th>
            <th>Status</th>
            <th>Effective Date</th>
            <th>Expiration Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {policies.map((policy: any) => (
            <tr key={policy._id ?? policy.id}>
              <td>{policy.policyNumber}</td>
              <td>{policy.holderName}</td>
              <td>{policy.type}</td>
              <td>
                <Currency amount={Number(policy.premium ?? 0)} />
              </td>
              <td>{policy.status}</td>
              <td>
                {policy.effectiveDate
                  ? new Date(policy.effectiveDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                {policy.expirationDate
                  ? new Date(policy.expirationDate).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <button
                  onClick={async () => {
                    try {
                      await api.delete(`/policies/${policy._id ?? policy.id}`);
                      setPolicies((currentPolicies) =>
                        currentPolicies.filter(
                          (p) => (p._id ?? p.id) !== (policy._id ?? policy.id),
                        ),
                      );
                    } catch (error: any) {
                      console.error("Failed to delete policy:", error);
                      const message =
                        error?.response?.status === 403
                          ? "Only admins can delete policies."
                          : error?.response?.data?.message ||
                            "Unable to delete policy right now.";
                      alert(message);
                    }
                  }}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
