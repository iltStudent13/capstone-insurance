import api from "../services/api";
import { useEffect, useState } from "react";
import Currency from "../components/Currency";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { type Policy } from "../types";

type ApiErrorResponse = {
  errors?: { msg: string }[];
  error?: string;
  message?: string;
};

export default function Policies() {
  const { user } = useAuth();
  const [policies, setPolicies] = useState<Policy[]>([]);
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

  useEffect(() => {
    let isActive = true;

    const loadPolicies = async () => {
      try {
        const params: Record<string, string> = {};
        if (typeFilter && typeFilter !== "all") params.type = typeFilter;
        if (searchTerm.trim()) params.search = searchTerm.trim();

        const response = await api.get("/policies", { params });

        if (isActive) {
          setPolicies(response.data?.policies ?? []);
        }
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadPolicies();

    return () => {
      isActive = false;
    };
  }, [searchTerm, typeFilter]);

  const handleTypeChange = (value: string) => {
    setTypeFilter(value);
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
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
    } catch (error: unknown) {
      let message = "Unable to create policy right now.";

      console.error("Failed to create policy:", error);
      if (axios.isAxiosError(error)) {
        const resp = error.response as
          { status?: number; data?: ApiErrorResponse } | undefined;

        message =
          resp?.status === 403
            ? "Only admins can create policies."
            : resp?.data?.errors?.[0]?.msg ||
              resp?.data?.error ||
              resp?.data?.message ||
              "Unable to create policy right now.";
      }

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
          {policies.map((policy: Policy) => (
            <tr key={policy._id}>
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
                      await api.delete(`/policies/${policy._id}`);
                      setPolicies((currentPolicies) =>
                        currentPolicies.filter((p) => p._id !== policy._id),
                      );
                    } catch (error: unknown) {
                      console.error("Failed to delete policy:", error);
                      const message = axios.isAxiosError(error)
                        ? error.response?.status === 403
                          ? "Only admins can delete policies."
                          : (
                              error.response?.data as
                                ApiErrorResponse | undefined
                            )?.message ||
                            (
                              error.response?.data as
                                ApiErrorResponse | undefined
                            )?.error ||
                            "Unable to delete policy right now."
                        : "Unable to delete policy right now.";
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
