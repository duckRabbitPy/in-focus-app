import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import { withAuth } from "@/utils/withAuth";
import { fetchWithAuth } from "@/utils/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const photoCardStyles = {
  card: {
    ...sharedStyles.card,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
    cursor: 'default',
  },
  photoHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  photoId: {
    ...sharedStyles.subtitle,
    fontFamily: 'var(--font-geist-mono)',
    fontSize: '1rem',
  },
  actions: {
    display: 'flex',
    gap: '0.5rem',
  },
  viewButton: {
    ...sharedStyles.secondaryButton,
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
  },
  editButton: {
    ...sharedStyles.button,
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
  },
};

interface Photo {
  id: number;
  roll_id: number;
  subject: string;
  photo_url: string | null;
  sequence_number: number;
  created_at: string;
}

function RollPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user_id || !roll_id) return;

    fetchWithAuth(`/api/user/${user_id}/rolls/${roll_id}/photos`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPhotos([]);
        } else {
          setPhotos(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load roll data");
        setPhotos([]);
        setLoading(false);
      });
  }, [user_id, roll_id]);

  if (loading) {
    return (
      <div style={{...sharedStyles.page, justifyContent: 'center', alignItems: 'center'}}>
        <p style={sharedStyles.subtitle}>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{...sharedStyles.page, justifyContent: 'center', alignItems: 'center'}}>
        <p style={sharedStyles.error}>{error}</p>
        <Link href={`/user/${user_id}/rolls`}>
          <button style={{...sharedStyles.button, marginTop: '1rem'}}>
            Back to Rolls
          </button>
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Roll #{roll_id} - In-focus</title>
        <meta name="description" content="View and manage your film roll photos" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href="/" style={sharedStyles.link}>Home</Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>Account</Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>Rolls</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Roll #{roll_id}</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Roll #{roll_id}</h1>
            <Link href={`/user/${user_id}/rolls/${roll_id}/new_photo`}>
              <button style={sharedStyles.button}>Add Photo</button>
            </Link>
          </div>

          {photos.length === 0 ? (
            <div style={{textAlign: 'center', padding: '2rem'}}>
              <p style={sharedStyles.subtitle}>No photos in this roll yet</p>
              <Link href={`/user/${user_id}/rolls/${roll_id}/new_photo`}>
                <button style={{...sharedStyles.button, marginTop: '1rem'}}>
                  Add Your First Photo
                </button>
              </Link>
            </div>
          ) : (
            <div style={sharedStyles.grid}>
              {photos.map((photo) => (
                <div key={photo.id} style={photoCardStyles.card}>
                  <div style={photoCardStyles.photoHeader}>
                    <span style={photoCardStyles.photoId}>Photo #{photo.sequence_number}</span>
                    <div style={photoCardStyles.actions}>
                      <Link href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/view`}>
                        <button style={photoCardStyles.viewButton}>View</button>
                      </Link>
                      <Link href={`/user/${user_id}/rolls/${roll_id}/${photo.id}/edit`}>
                        <button style={photoCardStyles.editButton}>Edit</button>
                      </Link>
                    </div>
                  </div>
                  <div style={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px',
                    padding: '1rem',
                    fontFamily: 'var(--font-geist-sans)',
                    fontSize: '0.9rem',
                    color: '#666',
                  }}>
                    {photo.subject || "No subject"}
                    {photo.photo_url && (
                      <div style={{marginTop: '0.5rem'}}>
                        <a 
                          href={photo.photo_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{color: '#0070f3', textDecoration: 'underline'}}
                        >
                          View Photo
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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

export default withAuth(RollPage);
