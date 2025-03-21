export function formatDateString(dateString: string | undefined): string {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    year: "2-digit",
    month: "short",
    day: "numeric",
  });
}
