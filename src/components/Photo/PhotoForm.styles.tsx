import { sharedStyles } from "@/styles/shared";

export const formStyles = {
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginTop: "1rem",
    marginBottom: "1rem",
    width: "100%",
    "@media (minWidth: 640px)": {
      marginBottom: "1.5rem",
    },
  },
  label: {
    fontSize: "0.85rem",
    color: "#333",
    fontFamily: "var(--font-geist-sans)",
    "@media (minWidth: 640px)": {
      fontSize: "0.9rem",
    },
  },
  select: {
    ...sharedStyles.input,
    backgroundColor: "#fff",
    width: "100%",
    paddingRight: "2rem",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    borderRadius: "4px",
    "&:active": {
      backgroundColor: "#f5f5f5",
    },
  },
  checkboxInput: {
    width: "1.4rem",
    height: "1.4rem",
    cursor: "pointer",
    "@media (minWidth: 640px)": {
      width: "1.2rem",
      height: "1.2rem",
    },
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginTop: "1.5rem",
    width: "100%",
    "@media (minWidth: 640px)": {
      flexDirection: "row",
      gap: "1rem",
      marginTop: "2rem",
    },
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.5rem",
    marginTop: "1rem",
    width: "100%",
    "@media (minWidth: 480px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  segmentedControl: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  segment: {
    padding: "0.5rem 1rem",
    border: "1px solid #e5e5e5",
    borderRadius: "4px",
    fontSize: "0.9rem",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#666",
    flex: 1,
    textAlign: "center" as const,
  },
  activeSegment: {
    backgroundColor: "#8E5D94",
    color: "#fff",
    borderColor: "#8E5D94",
  },
};
