import { useRouter } from "next/router";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import Head from "next/head";
import { withAuth } from "@/utils/withAuth";
import { geistMono, geistSans } from "@/styles/font";
import TagPicker from "@/components/TagPicker";
import { useState } from "react";
import { usePhotoSearch } from '@/hooks/usePhotoSearch';
import { formatDate } from '@/utils/date';

interface PhotoSearchResult {
  id: string;
  roll_id: string;
  subject: string;
  photo_url?: string;
  created_at: string;
  roll_name: string;
  tags: string[];
}

function SearchPage() {
  const router = useRouter();
  const { user_id } = router.query;
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const { photos, isLoading, error, searchPhotos } = usePhotoSearch(user_id as string);

  const handleSearch = () => {
    if (selectedTags.length > 0) {
      searchPhotos(selectedTags);
    }
  };

  if (!user_id || Array.isArray(user_id)) {
    return <p style={sharedStyles.error}>Invalid user ID</p>;
  }

  return (
    <>
      <Head>
        <title>Search - In-focus</title>
        <meta name="description" content="Add a new photo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>
              Account
            </Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>
              Rolls
            </Link>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Search Photos by Tags</h1>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <TagPicker
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
              userId={user_id as string}
              disableAdd
            />
            <button
              onClick={handleSearch}
              disabled={selectedTags.length === 0 || isLoading}
              style={{
                ...sharedStyles.button,
                marginTop: '1rem',
                width: '100%'
              }}
            >
              {isLoading ? 'Searching...' : 'Search Photos'}
            </button>
          </div>

          {error && (
            <p style={sharedStyles.error}>{error}</p>
          )}

          {photos.length > 0 && (
            <div style={{ overflowX: 'auto', width: '100%' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '1rem'
              }}>
                <thead>
                  <tr>
                    <th style={tableHeaderStyle}>Subject</th>
                    <th style={tableHeaderStyle}>Roll</th>
                    <th style={tableHeaderStyle}>Date</th>
                    <th style={tableHeaderStyle}>Tags</th>
                    <th style={tableHeaderStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {photos.map((photo) => (
                    <tr key={photo.id} style={tableRowStyle}>
                      <td style={tableCellStyle}>{photo.subject}</td>
                      <td style={tableCellStyle}>{photo.roll_name}</td>
                      <td style={tableCellStyle}>{formatDate(photo.created_at)}</td>
                      <td style={tableCellStyle}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {photo.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                backgroundColor: '#f3f4f6',
                                padding: '0.25rem 0.5rem',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem'
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={tableCellStyle}>
                        <Link
                          href={`/user/${user_id}/rolls/${photo.roll_id}/${photo.id}/view`}
                          style={sharedStyles.link}
                        >
                          View Details
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && !error && photos.length === 0 && selectedTags.length > 0 && (
            <p style={sharedStyles.subtitle}>No photos found with the selected tags.</p>
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

const tableHeaderStyle = {
  textAlign: 'left' as const,
  padding: '0.75rem',
  borderBottom: '2px solid #e5e7eb',
  backgroundColor: '#f9fafb'
};

const tableRowStyle = {
  borderBottom: '1px solid #e5e7eb',
  '&:hover': {
    backgroundColor: '#f9fafb'
  }
};

const tableCellStyle = {
  padding: '0.75rem',
  fontSize: '0.875rem'
};

export default withAuth(SearchPage);
