import { useState } from "react";
import Link from "next/link";
import { fetchWithAuth } from "@/utils/auth";
import { sharedStyles } from "@/styles/shared";
import { Roll } from "@/types/shared";
import { formatDateString } from "@/utils/date";

interface RollProps {
  roll: {
    id: number;
    name: string;
    film_type: string | null;
    iso: number | null;
    created_at: string;
    updated_at: string;
  };
  user_id: string;
  onDelete: (rollId: number) => void;
  onUpdate: (updatedRoll: Roll) => void;
}

export function RollCard({ roll, user_id, onDelete, onUpdate }: RollProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(roll.name);
  const [filmType, setFilmType] = useState(roll.film_type || "");
  const [iso, setIso] = useState(roll.iso !== null ? roll.iso.toString() : "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetchWithAuth(
        `/api/user/${user_id}/rolls/${roll.id}?name=${encodeURIComponent(
          name
        )}&film_type=${encodeURIComponent(filmType)}&iso=${encodeURIComponent(
          iso
        )}`,
        {
          method: "PUT",
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const updatedRoll = await response.json();
      onUpdate(updatedRoll);
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating roll:", err);
      setError("Failed to update roll");
    } finally {
      setIsSaving(false);
    }
  };

  const rollCardStyles = {
    card: {
      ...sharedStyles.card,
      display: "flex",
      flexDirection: "column" as const,
      gap: "1rem",
      cursor: "default",
      overflow: "scroll",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      ...sharedStyles.subtitle,
      fontFamily: "var(--font-geist-mono)",
      fontSize: "1.1rem",
      margin: 0,
    },
    details: {
      display: "grid",
      gap: "0.5rem",
    },
    label: {
      fontSize: "0.85rem",
      color: "#444",
      margin: 0,
    },
    value: {
      fontSize: "0.95rem",
      color: "#000",
      margin: 0,
      fontFamily: "var(--font-geist-mono)",
    },
    input: {
      padding: "0.5rem",
      border: "1px solid #ccc",
      borderRadius: "4px",
      fontFamily: "var(--font-geist-mono)",
      fontSize: "0.95rem",
    },
  };

  return (
    <div style={rollCardStyles.card}>
      <div style={rollCardStyles.header}>
        {isEditing ? (
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ ...rollCardStyles.input, fontWeight: "bold" }}
            placeholder="Roll Name"
            required
          />
        ) : (
          <Link href={`/user/${user_id}/rolls/${roll.id}`}>
            <h2
              style={{
                ...rollCardStyles.title,
                whiteSpace: "wrap",
                marginRight: "0.5rem",
              }}
            >
              {roll.name}
            </h2>
          </Link>
        )}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          {isEditing ? (
            <button
              style={{
                ...sharedStyles.button,
                backgroundColor: "#047857",
                marginLeft: "0.5rem",
              }}
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          ) : (
            <button
              style={sharedStyles.secondaryButton}
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
          )}

          {isEditing ? (
            <button
              style={sharedStyles.secondaryButton}
              onClick={() => {
                setIsEditing(false);
                setName(roll.name);
                setFilmType(roll.film_type || "");
                setIso(roll.iso !== null ? roll.iso.toString() : "");
                setError("");
              }}
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => onDelete(roll.id)}
              style={{
                ...sharedStyles.secondaryButton,
                color: "#dc2626",
                border: "2px solid #dc2626",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(220, 38, 38, 0.1)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
              aria-label="Delete roll"
            >
              Delete
            </button>
          )}
        </div>
      </div>
      <div style={rollCardStyles.details}>
        {isEditing ? (
          <>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <label
                htmlFor={`film_type_${roll.id}`}
                style={rollCardStyles.label}
              >
                Film Type
              </label>
              <input
                type="text"
                id={`film_type_${roll.id}`}
                value={filmType}
                onChange={(e) => setFilmType(e.target.value)}
                style={rollCardStyles.input}
                placeholder="Film Type"
              />
            </div>
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
            >
              <label htmlFor={`iso_${roll.id}`} style={rollCardStyles.label}>
                ISO
              </label>
              <input
                type="number"
                id={`iso_${roll.id}`}
                value={iso}
                onChange={(e) => setIso(e.target.value)}
                style={rollCardStyles.input}
                placeholder="ISO"
              />
            </div>
          </>
        ) : (
          <>
            {roll.film_type && (
              <div>
                <p style={rollCardStyles.label}>Film Type</p>
                <p style={rollCardStyles.value}>{roll.film_type}</p>
              </div>
            )}
            {roll.iso && (
              <div>
                <p style={rollCardStyles.label}>ISO</p>
                <p style={rollCardStyles.value}>{roll.iso}</p>
              </div>
            )}
          </>
        )}
        <div>
          <p style={rollCardStyles.label}>Created</p>
          <p style={rollCardStyles.value}>
            {formatDateString(roll.created_at)}
          </p>
        </div>
        {error && <p style={{ color: "#dc2626", margin: 0 }}>{error}</p>}
      </div>
    </div>
  );
}
