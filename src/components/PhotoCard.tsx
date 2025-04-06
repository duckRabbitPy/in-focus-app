import Link from "next/link";
import { useState } from "react";
import { FullPhotoSettingsData } from "@/types/photos";
import { sharedStyles } from "@/styles/shared";

type Props = {
  photo: FullPhotoSettingsData;
  index: number;
  user_id: string;
  roll_id: number;
  isEditing: boolean;
  setEditingIndex: (index: number | null) => void;
  onUpdateUrl: (params: {
    user_id: string;
    roll_id: number;
    photo_id: number;
    photo_url: string;
  }) => void;
  onDelete: () => void;
};

export function PhotoCard({
  photo,
  index,
  user_id,
  roll_id,
  isEditing,
  setEditingIndex,
  onUpdateUrl,
  onDelete,
}: Props) {
  const [tempUrl, setTempUrl] = useState(photo.photo_url || "");

  return (
    <div style={styles.card}>
      <div style={styles.photoHeader}>
        <Link href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/view`}>
          <span style={styles.photoId}>Photo #{photo.sequence_number}</span>
        </Link>
        <div style={styles.actions}>
          <Link href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/edit`}>
            <button style={styles.editButton}>Edit</button>
          </Link>
          <button
            onClick={onDelete}
            style={{
              ...sharedStyles.secondaryButton,
              color: "#dc2626",
              border: "2px solid #dc2626",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "rgba(220, 38, 38, 0.1)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
            aria-label="Delete photo"
          >
            Delete
          </button>
        </div>
      </div>

      <div
        style={{
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          padding: "1rem",
          fontFamily: "var(--font-geist-sans)",
          fontSize: "0.9rem",
          color: "#666",
        }}
      >
        <Link href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/view`}>
          {photo.subject || "No subject"}
        </Link>

        {photo.photo_url && !isEditing ? (
          <div style={{ marginTop: "0.5rem" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.photo_url}
              style={{
                width: "50px",
                height: "50px",
                objectFit: "cover",
              }}
              alt={photo.subject}
            />
          </div>
        ) : (
          <div>
            <input
              value={tempUrl}
              onChange={(e) => setTempUrl(e.target.value)}
              onClick={() => setEditingIndex(index)}
              style={{
                width: "100%",
                padding: "0.5rem",
                borderRadius: "4px",
                border: "1px solid #ccc",
                marginTop: "0.5rem",
              }}
              placeholder="No photo URL"
            />
            {isEditing && (
              <div style={{ ...styles.actions, gap: "0.25rem" }}>
                <button
                  style={{
                    ...sharedStyles.secondaryButton,
                    backgroundColor: sharedStyles.green,
                    color: "white",
                    border: "none",
                    width: "80px",
                    marginTop: "0.5rem",
                  }}
                  onClick={() => {
                    setEditingIndex(null);
                    onUpdateUrl({
                      user_id,
                      roll_id,
                      photo_id: photo.id,
                      photo_url: tempUrl,
                    });
                  }}
                >
                  update
                </button>
                <button
                  style={{
                    ...sharedStyles.secondaryButton,
                    border: "none",
                    width: "20px",
                    marginTop: "0.5rem",
                  }}
                  onClick={() => setEditingIndex(null)}
                >
                  X
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    ...sharedStyles.card,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    cursor: "default",
  },
  photoHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  photoId: {
    ...sharedStyles.subtitle,
    fontFamily: "var(--font-geist-mono)",
    fontSize: "1rem",
  },
  actions: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "stretch",
  },
  editButton: sharedStyles.button,
};
