import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import {
  useDocumentStatus,
  useUploadDocument,
} from "../queries/documentQueries";

import useUIStore from "../store/uiStore";
import { getApiErrorMessage } from "../services/apiError";

export default function Upload() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const chatId = searchParams.get("chatId");

  // UI state belongs to the component/Zustand.
  // Server state belongs to TanStack Query.
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const setSelectedChatId = useUIStore((state) => state.setSelectedChatId);

  const setSelectedDocumentId = useUIStore(
    (state) => state.setSelectedDocumentId,
  );

  const uploadMutation = useUploadDocument();

  const {
    data: document,
    error: statusError,
    isLoading: isStatusLoading,
  } = useDocumentStatus(documentId);

  /*
   * Upload document through TanStack Query mutation.
   */
  const handleUpload = async () => {
    setUploadError(null);

    if (!chatId) {
      setUploadError({
        title: "No chat selected",
        message: "Please create or select a chat before uploading a document.",
        action: "Go back",
      });
      return;
    }

    if (!file) {
      setUploadError({
        title: "No document selected",
        message: "Please select a document before uploading.",
        action: "Select document",
      });
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync({
        file,
        chatId,
      });

      const newDocumentId = result.document?._id;

      if (!newDocumentId) {
        throw new Error("Document ID was not returned by the server.");
      }

      setDocumentId(newDocumentId);

      // Store UI selections in Zustand.
      setSelectedChatId(chatId);
      setSelectedDocumentId(newDocumentId);
    } catch (error) {
      console.error("UPLOAD ERROR:", error);

      setUploadError(getApiErrorMessage(error));
    }
  };

  /*
   * Retry upload after network timeout or 5xx failure.
   */
  const handleRetry = () => {
    setUploadError(null);

    if (file && chatId) {
      handleUpload();
    }
  };

  /*
   * Convert backend processing statuses into the
   * assessment-required frontend state machine.
   *
   * Backend:
   * pending -> processing -> completed / failed
   *
   * Frontend:
   * queued -> processing -> ready / failed
   */
  const getDocumentStatus = () => {
    if (!document) {
      return null;
    }

    switch (document.processingStatus) {
      case "pending":
        return {
          state: "queued",
          title: "Document queued",
          message: "Your document is waiting to be processed.",
        };

      case "processing":
        return {
          state: "processing",
          title: "Processing document",
          message:
            "The document is currently being processed by the AI service.",
        };

      case "completed":
        return {
          state: "ready",
          title: "Document ready",
          message: "Your document has been processed successfully.",
        };

      case "failed":
        return {
          state: "failed",
          title: "Document processing failed",
          message:
            "The document could not be processed. You can try uploading it again.",
        };

      default:
        return {
          state: "unknown",
          title: "Unknown document status",
          message: "The document returned an unexpected processing status.",
        };
    }
  };

  const status = getDocumentStatus();

  /*
   * Query errors are handled separately from upload errors.
   */
  const displayError = statusError
    ? getApiErrorMessage(statusError)
    : uploadError;

  /*
   * Once an upload starts, don't allow another upload
   * until the current document reaches ready/failed.
   */
  const uploadDisabled =
    uploadMutation.isPending || !chatId || Boolean(documentId);

  return (
    <div style={styles.page}>
      {/* HEADER */}
      <header style={styles.header}>
        <div style={styles.logo}>Enterprise Document Intelligence</div>
      </header>

      {/* MAIN CONTENT */}
      <main style={styles.main}>
        <div style={styles.card}>
          {/* TITLE */}
          <div style={styles.titleSection}>
            <h1 style={styles.title}>Upload Document</h1>

            <p style={styles.subtitle}>
              Add a document to this conversation and start asking questions
              about its contents.
            </p>
          </div>

          {/* NO CHAT */}
          {!chatId && (
            <div style={styles.errorBox}>
              <strong>No chat selected</strong>

              <div style={{ marginTop: "5px" }}>
                Please create a new chat first.
              </div>
            </div>
          )}

          {/* FILE SELECT AREA */}
          <label style={styles.fileArea}>
            <div style={styles.fileIcon}>↑</div>

            <div style={styles.fileTitle}>
              {file ? file.name : "Choose a document"}
            </div>

            <div style={styles.fileSubtitle}>
              {file
                ? "Document selected"
                : "Click here to select a file from your computer"}
            </div>

            <input
              type="file"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;

                setFile(selectedFile);
                setUploadError(null);
                setDocumentId(null);
              }}
              style={styles.fileInput}
            />
          </label>

          {/* SELECTED FILE */}
          {file && (
            <div style={styles.selectedFile}>
              <div>
                <div style={styles.selectedLabel}>Selected document</div>

                <div style={styles.selectedName}>{file.name}</div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setFile(null);
                  setUploadError(null);
                  setDocumentId(null);
                  setSelectedDocumentId(null);
                }}
                style={styles.removeButton}
                disabled={uploadMutation.isPending}
              >
                Remove
              </button>
            </div>
          )}

          {/* UPLOAD BUTTON */}
          <button
            onClick={handleUpload}
            disabled={uploadDisabled}
            style={{
              ...styles.primaryButton,
              opacity: uploadDisabled ? 0.55 : 1,
              cursor: uploadDisabled ? "not-allowed" : "pointer",
            }}
          >
            {uploadMutation.isPending ? "Uploading..." : "Upload Document"}
          </button>

          {/* DOCUMENT PROCESSING STATE */}
          {documentId && (
            <div style={styles.statusBox}>
              {isStatusLoading && !status ? (
                <>
                  <div style={styles.statusTitle}>Document queued</div>

                  <div style={styles.statusMessage}>
                    Waiting for processing status...
                  </div>

                  <div style={styles.statusIndicator}>QUEUED</div>
                </>
              ) : status ? (
                <>
                  <div style={styles.statusTitle}>{status.title}</div>

                  <div style={styles.statusMessage}>{status.message}</div>

                  <div style={styles.statusIndicator}>{status.state}</div>

                  {/* READY */}
                  {status.state === "ready" && (
                    <button
                      type="button"
                      onClick={() => navigate(`/chat/${chatId}`)}
                      style={{
                        ...styles.primaryButton,
                        marginTop: "12px",
                      }}
                    >
                      Open Chat
                    </button>
                  )}

                  {/* FAILED */}
                  {status.state === "failed" && (
                    <button
                      type="button"
                      onClick={() => {
                        setDocumentId(null);
                        setFile(null);
                        setSelectedDocumentId(null);
                      }}
                      style={{
                        ...styles.primaryButton,
                        marginTop: "12px",
                      }}
                    >
                      Upload Again
                    </button>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* SPECIFIC API ERROR */}
          {displayError && (
            <div style={styles.errorBox}>
              <strong>{displayError.title}</strong>

              <div style={{ marginTop: "5px" }}>{displayError.message}</div>

              {/* TIMEOUT / SERVER ERROR */}
              {displayError.action === "Retry" && (
                <button
                  type="button"
                  onClick={handleRetry}
                  style={styles.errorActionButton}
                >
                  Retry
                </button>
              )}

              {/* 401 */}
              {displayError.action === "Sign in again" && (
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  style={styles.errorActionButton}
                >
                  Sign in again
                </button>
              )}

              {/* Other errors such as 403 */}
              {displayError.action === "Go back" && (
                <button
                  type="button"
                  onClick={() =>
                    chatId
                      ? navigate(`/chat/${chatId}`)
                      : navigate("/dashboard")
                  }
                  style={styles.errorActionButton}
                >
                  Go back
                </button>
              )}
            </div>
          )}

          {/* BACK */}
          <button
            onClick={() =>
              chatId ? navigate(`/chat/${chatId}`) : navigate("/dashboard")
            }
            style={styles.secondaryButton}
          >
            Back
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f6f8",
    fontFamily:
      "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    color: "#171717",
  },

  header: {
    height: "72px",
    background: "#111111",
    display: "flex",
    alignItems: "center",
    padding: "0 40px",
    boxSizing: "border-box",
  },

  logo: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "600",
    letterSpacing: "-0.3px",
  },

  main: {
    minHeight: "calc(100vh - 72px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "40px 20px",
    boxSizing: "border-box",
  },

  card: {
    width: "520px",
    background: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: "12px",
    padding: "36px",
    boxSizing: "border-box",
    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.06)",
  },

  titleSection: {
    marginBottom: "28px",
  },

  title: {
    margin: "0 0 8px 0",
    fontSize: "28px",
    fontWeight: "650",
    letterSpacing: "-0.6px",
  },

  subtitle: {
    margin: 0,
    color: "#6b7280",
    fontSize: "14px",
    lineHeight: "1.6",
  },

  fileArea: {
    position: "relative",
    display: "block",
    border: "1.5px dashed #cbd5e1",
    borderRadius: "9px",
    padding: "35px 20px",
    textAlign: "center",
    cursor: "pointer",
    background: "#fafafa",
    marginBottom: "18px",
  },

  fileIcon: {
    width: "42px",
    height: "42px",
    margin: "0 auto 12px auto",
    borderRadius: "50%",
    background: "#111111",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "500",
  },

  fileTitle: {
    fontSize: "15px",
    fontWeight: "600",
    color: "#171717",
    wordBreak: "break-word",
  },

  fileSubtitle: {
    marginTop: "6px",
    fontSize: "13px",
    color: "#6b7280",
  },

  fileInput: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    opacity: 0,
    cursor: "pointer",
  },

  selectedFile: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "15px",
    padding: "13px 14px",
    marginBottom: "18px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "7px",
  },

  selectedLabel: {
    fontSize: "11px",
    color: "#6b7280",
    marginBottom: "3px",
  },

  selectedName: {
    fontSize: "13px",
    fontWeight: "600",
    wordBreak: "break-word",
  },

  removeButton: {
    background: "transparent",
    border: "none",
    color: "#dc2626",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },

  primaryButton: {
    width: "100%",
    height: "46px",
    background: "#111111",
    color: "#ffffff",
    border: "none",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },

  secondaryButton: {
    width: "100%",
    height: "44px",
    marginTop: "12px",
    background: "#ffffff",
    color: "#374151",
    border: "1px solid #d1d5db",
    borderRadius: "7px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  },

  statusBox: {
    marginTop: "16px",
    padding: "14px",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    background: "#fafafa",
  },

  statusTitle: {
    fontSize: "14px",
    fontWeight: "600",
    color: "#171717",
  },

  statusMessage: {
    marginTop: "5px",
    fontSize: "13px",
    color: "#6b7280",
    lineHeight: "1.5",
  },

  statusIndicator: {
    marginTop: "10px",
    fontSize: "12px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  errorBox: {
    marginTop: "16px",
    marginBottom: "16px",
    padding: "11px 12px",
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "7px",
    fontSize: "13px",
  },

  errorActionButton: {
    marginTop: "10px",
    border: "none",
    background: "transparent",
    padding: 0,
    color: "#b91c1c",
    fontWeight: "600",
    cursor: "pointer",
  },
};
