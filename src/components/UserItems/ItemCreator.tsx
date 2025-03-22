import { sharedStyles } from "@/styles/shared";
import React, { useState } from "react";

interface GenericItemCreatorProps {
  onCreate: (name: string) => Promise<boolean>;
  entityLabel: "Tag" | "Lens";
}

export const ItemCreator = ({
  onCreate,
  entityLabel,
}: GenericItemCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [emptyError, setEmptyError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateItem = async () => {
    if (newItemName.trim() === "") {
      setEmptyError(`${entityLabel} name cannot be empty`);
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await onCreate(newItemName);

      if (success) {
        setNewItemName("");
        setIsCreating(false);
        setEmptyError("");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {isCreating ? (
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => {
                setNewItemName(e.target.value);
                if (e.target.value.trim() !== "") {
                  setEmptyError("");
                }
              }}
              placeholder={`Enter new ${entityLabel.toLowerCase()} name`}
              autoFocus
              style={{ ...sharedStyles.input, flex: 3, minWidth: 0 }}
              disabled={isSubmitting}
            />
            <button
              type="button"
              onClick={handleCreateItem}
              style={{
                ...sharedStyles.button,
                padding: "0.75rem 1rem",
                maxWidth: "fit-content",
                whiteSpace: "nowrap",
                opacity: isSubmitting ? 0.7 : 1,
                cursor: isSubmitting ? "not-allowed" : "pointer",
              }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : `Add ${entityLabel.toLowerCase()}`}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsCreating(false);
                setNewItemName("");
                setEmptyError("");
              }}
              style={{
                ...sharedStyles.secondaryButton,
                padding: "0.75rem 1rem",
                maxWidth: "fit-content",
                whiteSpace: "nowrap",
              }}
              disabled={isSubmitting}
            >
              Cancel
            </button>
          </div>
          {emptyError && (
            <p
              style={{
                ...sharedStyles.error,
                margin: 0,
                fontSize: "0.875rem",
              }}
            >
              {emptyError}
            </p>
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          style={{
            ...sharedStyles.button,
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "44px",
            minWidth: "44px",
            fontSize: "1.25rem",
            height: "44px",
          }}
        >
          +
        </button>
      )}
    </div>
  );
};

export default ItemCreator;
