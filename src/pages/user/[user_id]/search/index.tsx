/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { geistMono, geistSans } from "@/styles/font";
import TagPicker from "@/components/UserItems/TagPicker";
import { useState, useEffect } from "react";
import { PageHead } from "@/components/PageHead";
import { searchPhotosByTags } from "@/requests/queries/search";
import { useQuery } from "@tanstack/react-query";
import PhotoTable from "@/components/PhotoTable";

function SearchPage() {
  const router = useRouter();
  const {
    user_id,
    tags: queryParamTags,
    search: queryParamSearch,
  } = router.query;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  const [page, setPage] = useState(1);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);

      if (searchTerm !== debouncedSearchTerm) {
        setPage(1);
      }
      router.push(
        {
          pathname: router.pathname,
          query: {
            ...router.query,
            search: searchTerm,
          },
        },
        undefined,
        { shallow: true }
      );
    }, 500);

    return () => clearTimeout(handler);
  }, [searchTerm, router, debouncedSearchTerm]);

  // Initialize selected tags and search term from URL query params when available
  useEffect(() => {
    if (queryParamTags) {
      const tagsArray = Array.isArray(queryParamTags)
        ? queryParamTags
        : [queryParamTags];
      setSelectedTags(tagsArray);
    }

    if (queryParamSearch && typeof queryParamSearch === "string") {
      setSearchTerm(queryParamSearch);
      setDebouncedSearchTerm(queryParamSearch);
    }
  }, [queryParamTags, queryParamSearch]);

  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);
    setPage(1);
    // Update the URL without reloading the page
    // This synchronizes the query params made in latest API call with query params in URL
    // allows user to share URL and initialize with the same tags
    router.push(
      {
        pathname: router.pathname,
        query: {
          ...router.query,
          tags: newTags.length > 0 ? newTags : undefined,
        },
      },
      undefined,
      { shallow: true }
    );
  };

  const {
    data: { photos, pagination } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photoSearch", user_id, selectedTags, debouncedSearchTerm, page],
    queryFn: () =>
      searchPhotosByTags({
        user_id: user_id as string,
        tags: selectedTags,
        searchTerm,
        page,
        pageSize: 10,
      }),
    enabled: !!user_id,
  });

  if (!user_id || Array.isArray(user_id)) {
    return <p style={sharedStyles.error}>Invalid user ID</p>;
  }

  return (
    <>
      <PageHead title="Search" description="Search photos" />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={{ ...sharedStyles.main, gap: "1rem" }}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>
              Home
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>
              Rolls
            </Link>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Search all Photos</h1>
          </div>

          <input
            type="text"
            name="search"
            value={searchTerm}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                // Exit input field on Enter key press
                e.currentTarget.blur();
              }
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            placeholder="Search by subject"
            style={{ ...sharedStyles.input, width: "250px" }}
          />

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <TagPicker
              selectedTags={selectedTags}
              onTagsChange={handleTagsChange}
              userId={user_id as string}
              disableAdd
            />

            {(pagination?.totalPages || 0) > 1 && (
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
                  value={page}
                  onChange={(e) => {
                    setPage(Number(e.target.value));
                  }}
                  style={{
                    ...sharedStyles.input,
                    width:
                      pagination && pagination?.totalPages > 99
                        ? "80px"
                        : "50px",
                    padding: "0.25rem",
                  }}
                >
                  {pagination?.totalPages &&
                    Array.from({ length: pagination.totalPages }, (_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
          {error && <p style={sharedStyles.error}>{error.message}</p>}

          <div style={{ overflowX: "auto", width: "100%", height: "50vh" }}>
            <PhotoTable
              photos={photos}
              isLoading={isLoading}
              error={error}
              selectedTags={selectedTags}
              user_id={user_id}
            />
          </div>
        </main>
      </div>
    </>
  );
}

export const styles = {
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

export default withAuth(SearchPage);
