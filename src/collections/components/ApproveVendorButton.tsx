"use client";

import { useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";
import { CheckCircle2, Loader2 } from "lucide-react";

export const ApproveVendorButton: React.FC<{ path: string; value?: any; onChange?: (value: any) => void }> = ({ path, value, onChange }) => {
  const { id } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);

  const handleApprove = async () => {
    if (!id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/vendors/${id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve vendor");
      }

      // Reload the page to reflect changes
      window.location.reload();
    } catch (error: any) {
      alert(error.message || "Failed to approve vendor");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem", backgroundColor: "#f0fdf4", border: "1px solid #86efac", borderRadius: "4px", marginBottom: "1rem" }}>
      <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.875rem" }}>
        Quick Actions
      </label>
      <p style={{ fontSize: "0.875rem", color: "#6b7280", marginBottom: "0.75rem" }}>
        Approve and activate this vendor with one click.
      </p>
      <button
        onClick={handleApprove}
        disabled={isLoading}
        type="button"
        style={{
          backgroundColor: "#16a34a",
          color: "white",
          border: "none",
          padding: "0.5rem 1rem",
          borderRadius: "4px",
          cursor: isLoading ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          fontWeight: 500,
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ width: "1rem", height: "1rem", animation: "spin 1s linear infinite" }} />
            Approving...
          </>
        ) : (
          <>
            <CheckCircle2 style={{ width: "1rem", height: "1rem" }} />
            Approve & Activate Vendor
          </>
        )}
      </button>
      <p style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7280" }}>
        This will set status to "Approved" and activate the vendor account.
      </p>
    </div>
  );
};
