import { sharedStyles } from "@/styles/shared";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "1.5rem",
          maxWidth: "400px",
          width: "100%",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2
          style={{
            margin: 0,
            marginBottom: "1rem",
            fontSize: "1.25rem",
            fontWeight: 600,
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            marginBottom: "1.5rem",
            color: "#666",
            fontSize: "0.95rem",
            fontFamily: "var(--font-geist-sans)",
          }}
        >
          {message}
        </p>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            justifyContent: "flex-end",
          }}
        >
          <button onClick={onClose} style={sharedStyles.secondaryButton}>
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
            }}
            style={{
              ...sharedStyles.button,
              backgroundColor: "#dc2626",
              borderColor: "#dc2626",
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
