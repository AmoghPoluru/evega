"use client";

import { useState } from "react";
import { useDocumentInfo } from "@payloadcms/ui";
import { RefreshCw, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export const SyncStripeDetailsButton: React.FC<{ 
  path: string; 
  value?: any; 
  onChange?: (value: any) => void 
}> = ({ path, value, onChange }) => {
  const { id } = useDocumentInfo();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSync = async () => {
    if (!id) return;

    setIsLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch(`/api/vendors/${id}/sync-stripe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || "Failed to sync Stripe details");
      }

      setMessage({
        type: "success",
        text: data.message || "Stripe details synced successfully!",
      });

      // Reload the page after a short delay to reflect changes
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Failed to sync Stripe details",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: "1rem", 
      backgroundColor: "#f0f9ff", 
      border: "1px solid #bae6fd", 
      borderRadius: "4px", 
      marginBottom: "1rem" 
    }}>
      <label style={{ 
        display: "block", 
        marginBottom: "0.5rem", 
        fontWeight: 600, 
        fontSize: "0.875rem",
        color: "#0c4a6e"
      }}>
        Sync Stripe Account Details
      </label>
      <p style={{ 
        fontSize: "0.875rem", 
        color: "#6b7280", 
        marginBottom: "0.75rem" 
      }}>
        Fetch the latest Stripe account information from Stripe API and update this vendor record.
      </p>
      <button
        onClick={handleSync}
        disabled={isLoading}
        type="button"
        style={{
          backgroundColor: "#0284c7",
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
          opacity: isLoading ? 0.6 : 1,
        }}
      >
        {isLoading ? (
          <>
            <Loader2 style={{ 
              width: "1rem", 
              height: "1rem", 
              animation: "spin 1s linear infinite" 
            }} />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw style={{ width: "1rem", height: "1rem" }} />
            Sync Stripe Details
          </>
        )}
      </button>
      
      {message && (
        <div style={{
          marginTop: "0.75rem",
          padding: "0.5rem",
          borderRadius: "4px",
          backgroundColor: message.type === "success" ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${message.type === "success" ? "#86efac" : "#fca5a5"}`,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.875rem",
          color: message.type === "success" ? "#166534" : "#991b1b"
        }}>
          {message.type === "success" ? (
            <CheckCircle2 style={{ width: "1rem", height: "1rem" }} />
          ) : (
            <AlertCircle style={{ width: "1rem", height: "1rem" }} />
          )}
          <span>{message.text}</span>
        </div>
      )}
      
      <p style={{ 
        marginTop: "0.5rem", 
        fontSize: "0.75rem", 
        color: "#6b7280" 
      }}>
        This will update: account status, capabilities, business details, requirements, and more.
      </p>
    </div>
  );
};
