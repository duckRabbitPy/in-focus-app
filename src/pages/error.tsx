// general error page something went wrong

import { sharedStyles } from "@/styles/shared";
import Link from "next/link";

export default function ErrorPage() {
  return (
    <div style={sharedStyles.page}>
      <div
        style={{
          ...sharedStyles.header,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <h1>Error</h1>

        <p>Sorry, something went wrong. Please try again later.</p>
        <Link href="/" style={sharedStyles.link}>
          <button style={sharedStyles.button}>Back to Home</button>
        </Link>
      </div>
    </div>
  );
}
