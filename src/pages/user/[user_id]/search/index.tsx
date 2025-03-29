/* eslint-disable @next/next/no-img-element */
import { useRouter } from "next/router";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { geistMono, geistSans } from "@/styles/font";
import TagPicker from "@/components/UserItems/TagPicker";
import { useState, useEffect } from "react";
import { formatDateString } from "@/utils/date";
import { PageHead } from "@/components/PageHead";
import { searchPhotosByTags } from "@/requests/queries/search";
import { useQuery } from "@tanstack/react-query";

function SearchPage() {
  const router = useRouter();
  const { user_id, tags: queryParamTags } = router.query;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Initialize selected tags from URL query params when available
  useEffect(() => {
    if (queryParamTags) {
      const tagsArray = Array.isArray(queryParamTags)
        ? queryParamTags
        : [queryParamTags];
      setSelectedTags(tagsArray);
    }
  }, [queryParamTags]);

  const handleTagsChange = (newTags: string[]) => {
    setSelectedTags(newTags);

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
    data: { photos } = {},
    isLoading,
    error,
  } = useQuery({
    queryKey: ["photoSearch", user_id, selectedTags],
    queryFn: () =>
      searchPhotosByTags({ user_id: user_id as string, tags: selectedTags }),
    enabled: !!user_id && selectedTags.length > 0,
  });

  if (!user_id || Array.isArray(user_id)) {
    return <p style={sharedStyles.error}>Invalid user ID</p>;
  }

  return (
    <>
      <PageHead title="Search" description="Search photos by tags" />
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
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
            <h1 style={sharedStyles.title}>Search Photos by Tags</h1>
          </div>

          <TagPicker
            selectedTags={selectedTags}
            onTagsChange={handleTagsChange}
            userId={user_id as string}
            disableAdd
          />

          {error && <p style={sharedStyles.error}>{error.message}</p>}

          <div style={{ overflowX: "auto", width: "100%", height: "40vh" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginTop: "1rem",
              }}
            >
              <thead>
                <tr>
                  <th style={styles.tableHeaderStyle}>Subject</th>
                  <th style={styles.tableHeaderStyle}>Preview</th>
                  <th style={styles.tableHeaderStyle}>Roll</th>
                  <th style={styles.tableHeaderStyle}>Date</th>
                  <th style={styles.tableHeaderStyle}>Tags</th>
                </tr>
              </thead>
              <tbody>
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
          </div>

          {!isLoading &&
            !error &&
            photos?.length === 0 &&
            selectedTags.length > 0 && (
              <p style={sharedStyles.subtitle}>
                No photos found with the selected tags.
              </p>
            )}
        </main>
        <footer style={sharedStyles.footer}>
          <Link
            href="https://github.com/DuckRabbitPy"
            target="_blank"
            rel="noopener noreferrer"
            style={sharedStyles.link}
          >
            DuckRabbitPy
          </Link>
        </footer>
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
