import { sharedStyles } from "@/styles/shared";

export const PaginationSelect = ({
  totalPages,
  currentPage,
  onPageChange,
}: {
  totalPages: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedPage = Number(e.target.value);
    onPageChange(selectedPage);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
      }}
    >
      <label
        htmlFor="page"
        style={{
          ...sharedStyles.label,
          marginBottom: "0.5rem",
        }}
      >
        Page
      </label>
      <select
        name="page"
        value={currentPage}
        onChange={handlePageChange}
        style={{
          ...sharedStyles.input,
          //   increase width to accommodate larger numbers
          width: `${40 + Math.log10(Math.max(totalPages, 1)) * 15}px`,
          padding: "0.25rem",
        }}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </select>
    </div>
  );
};
