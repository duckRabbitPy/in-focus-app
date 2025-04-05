import { sharedStyles } from "@/styles/shared";
import Link from "next/link";

export const Footer = () => {
  return (
    <footer style={styles}>
      <Link
        href="https://github.com/DuckRabbitPy"
        target="_blank"
        rel="noopener noreferrer"
        style={sharedStyles.link}
      >
        DuckRabbitPy
      </Link>
    </footer>
  );
};

const styles = {
  padding: "1rem",
  textAlign: "center" as const,
  borderTop: "1px solid #eaeaea",
  "@media (minWidth: 640px)": {
    padding: "1.5rem",
  },
  "@media (minWidth: 768px)": {
    padding: "2rem",
  },
};
