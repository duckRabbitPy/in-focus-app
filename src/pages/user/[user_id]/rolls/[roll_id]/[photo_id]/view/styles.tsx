export const styles = {
  detailsCard: {
    cursor: "default",
    width: "100%",
    maxWidth: "800px",
    padding: "1rem",
    "@media (minWidth: 640px)": {
      maxWidth: "600px",
      padding: "1.5rem",
    },
  },
  detailsGroup: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "1rem",
    marginBottom: "1.5rem",
    "@media (minWidth: 480px)": {
      gridTemplateColumns: "repeat(2, 1fr)",
    },
    "@media (minWidth: 768px)": {
      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
      gap: "1.5rem",
      marginBottom: "2rem",
    },
  },
  detailItem: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.25rem",
  },
  label: {
    fontSize: "0.85rem",
    color: "#666",
    fontFamily: "var(--font-geist-sans)",
    "@media (minWidth: 640px)": {
      fontSize: "0.9rem",
    },
  },
  value: {
    fontSize: "1rem",
    color: "#000",
    fontFamily: "var(--font-geist-mono)",
    margin: 0,
    "@media (minWidth: 640px)": {
      fontSize: "1.1rem",
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
  booleanGroup: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    marginTop: "1rem",
    "@media (minWidth: 480px)": {
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
      gap: "1rem",
      padding: "1rem",
    },
  },
  title: {
    marginBottom: "1.5rem",
    "@media (minWidth: 640px)": {
      marginBottom: "2rem",
    },
  },
  linkContainer: {
    width: "100%",
    "@media (minWidth: 640px)": {
      width: "auto",
    },
  },
  valueLink: {
    color: "#0070f3",
    textDecoration: "underline",
  },
  valueDisabled: {
    color: "#666",
  },
};
