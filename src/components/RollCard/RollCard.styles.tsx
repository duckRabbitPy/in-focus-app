import { sharedStyles } from "@/styles/shared";

export const rollCardStyles = {
  card: {
    ...sharedStyles.card,
    display: "flex",
    flexDirection: "column" as const,
    gap: "1rem",
    cursor: "default",
    overflowX: "auto",
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
