import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../services/api";
import Currency from "../components/Currency";

const statusOptions = [
  { value: "submitted", label: "Submitted" },
  { value: "under-review", label: "Under Review" },
  { value: "approved", label: "Approved" },
  { value: "denied", label: "Denied" },
  { value: "closed", label: "Closed" },
];

const ClaimsDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [claim, setClaim] = useState<any>(null);
  const [status, setStatus] = useState<string>("");
  const [note, setNote] = useState<string>("");

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await api.get(`/claims/${id}`);
        setClaim(response.data);
        setStatus(response.data.status || "submitted");
      } catch (error) {
        console.error("Error fetching claim:", error);
      }
    };
    if (id) fetchClaim();
  }, [id]);

  return (
    <div>
      {claim ? (
        <div>
          <h2>Claim Details</h2>
          <table className="claim-detail-table">
            <thead>
              <tr>
                <th>Claim Number</th>
                <th>Policy Number</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Status</th>
                <th className="claim-action-header">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{claim.claimNumber}</td>
                <td>{claim.policyNumber}</td>
                <td>
                  <Currency amount={claim.amount} />
                </td>
                <td>{claim.description}</td>
                <td>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="claim-action-cell">
                  <div className="claim-table-action-box">
                    <button
                      onClick={async () => {
                        try {
                          await api.put(`/claims/${id}`, { status });
                          alert("Status updated successfully");
                        } catch (error: any) {
                          console.error("Error updating status:", error);
                          const message =
                            error?.response?.status === 403
                              ? "Only admins can update claim status."
                              : error?.response?.data?.message ||
                                "Unable to update status right now.";
                          alert(message);
                        }
                      }}
                    >
                      Update Status
                    </button>
                    <button
                      onClick={async () => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this claim?",
                          )
                        ) {
                          try {
                            await api.delete(`/claims/${id}`);
                            alert("Claim deleted successfully");
                            window.location.href = "/claims";
                          } catch (error: any) {
                            console.error("Error deleting claim:", error);
                            const message =
                              error?.response?.status === 403
                                ? "Only admins can delete claims."
                                : error?.response?.data?.message ||
                                  "Unable to delete claim right now.";
                            alert(message);
                          }
                        }
                      }}
                    >
                      Delete Claim
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div>
            <h3>Notes</h3>
            {claim.notes && claim.notes.length > 0 ? (
              <table className="claim-detail-table">
                <thead>
                  <tr>
                    <th>Author</th>
                    <th>Note</th>
                    <th>Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.notes.map((noteItem: any) => (
                    <tr
                      key={
                        noteItem._id ??
                        `${noteItem.author}-${noteItem.createdAt}`
                      }
                    >
                      <td>{noteItem.author}</td>
                      <td>{noteItem.text}</td>
                      <td>
                        {noteItem.createdAt
                          ? new Date(noteItem.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No notes available.</p>
            )}
          </div>

          <div className="claim-detail-note">
            <label>
              Add Note:
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </label>
            <button
              onClick={async () => {
                try {
                  await api.post(`/claims/${id}/notes`, { text: note });
                  alert("Note added successfully");
                  setNote("");
                  const response = await api.get(`/claims/${id}`);
                  setClaim(response.data);
                } catch (error) {
                  console.error("Error adding note:", error);
                  const message =
                    error?.response?.status === 400
                      ? "Minimum note length not met."
                      : error?.response?.data?.message ||
                        "Unable to add note right now.";
                  alert(message);
                }
              }}
            >
              Add Note
            </button>
          </div>
        </div>
      ) : (
        <p>Loading claim details...</p>
      )}
    </div>
  );
};

export default ClaimsDetail;
