import React from "react";
import Link from "next/link";
import { sharedStyles } from "@/styles/shared";
import { SearchResponse } from "@/types/search";
import { formatDateString } from "@/utils/date";

const styles = {
  tableHeaderStyle: {
    textAlign: "left" as const,
    padding: "0.75rem",
    borderBottom: "2px solid #e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tableRowStyle: {
    borderBottom: "1px solid #e5e7eb",
    "&:hover": {
      backgroundColor: "#f9fafb",
    },
  },
  tableCellStyle: {
    padding: "0.75rem",
    fontSize: "0.875rem",
  },
};

interface PhotoTableProps {
  photos: SearchResponse["photos"] | undefined;
  isLoading: boolean;
  error: Error | null;
  selectedTags: string[];
  user_id: string;
}

const PhotoTable = ({
  photos,
  isLoading,
  error,
  selectedTags,
  user_id,
}: PhotoTableProps) => {
  return (
    <table
      style={{
        width: "100%",
        borderCollapse: "collapse",
      }}
    >
      <thead style={{ position: "sticky", top: 0 }}>
        <tr>
          <th style={styles.tableHeaderStyle}>Subject</th>
          <th style={styles.tableHeaderStyle}>Preview</th>
          <th style={styles.tableHeaderStyle}>Roll</th>
          <th style={styles.tableHeaderStyle}>Date</th>
          <th style={styles.tableHeaderStyle}>Tags</th>
        </tr>
      </thead>
      <tbody>
        {!isLoading &&
          !error &&
          photos?.length === 0 &&
          selectedTags.length > 0 && (
            <tr>
              <td colSpan={5}>
                <p style={{ ...sharedStyles.subtitle, marginTop: "1rem" }}>
                  No photos found with the selected tags/search term
                </p>
              </td>
            </tr>
          )}
        {photos?.map((photo) => (
          <tr key={photo.id} style={styles.tableRowStyle}>
            <td style={styles.tableCellStyle}>
              <Link
                href={`/user/${user_id}/rolls/${photo.roll_id}/${photo.id}/view`}
                style={sharedStyles.link}
              >
                {photo.subject}
              </Link>
            </td>
            <td style={styles.tableCellStyle}>
              {photo.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.photo_url}
                  alt={photo.subject}
                  style={{ width: "50px", height: "auto" }}
                />
              ) : (
                "-"
              )}
            </td>
            <td style={styles.tableCellStyle}>{photo.roll_name}</td>
            <td style={styles.tableCellStyle}>
              {formatDateString(photo.created_at)}
            </td>
            <td style={styles.tableCellStyle}>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                }}
              >
                {photo.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      backgroundColor: "#f3f4f6",
                      padding: "0.25rem 0.5rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PhotoTable;
