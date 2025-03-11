import { PhotoSettingsData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { sharedStyles } from "@/styles/shared";
import styles from "@/styles/ViewPhoto.module.css";
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

function ViewPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<PhotoSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user_id || !roll_id || !photo_id) return;

    fetchWithAuth(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          setPhoto(null);
        } else {
          setPhoto(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load photo data");
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  const LoadingState = () => (
    <div style={{textAlign: 'center', padding: '2rem'}}>
      <p style={sharedStyles.subtitle}>Loading...</p>
    </div>
  );

  const ErrorState = () => (
    <div style={{textAlign: 'center', padding: '2rem'}}>
      <p style={sharedStyles.error}>
        {error === "Missing authentication token" ? 
          "Please log in to view this page" : 
          error || "Photo not found"}
      </p>
      <Link href={error === "Missing authentication token" ? "/" : `/user/${user_id}/rolls/${roll_id}`}>
        <button style={{...sharedStyles.button, marginTop: '1rem'}}>
          {error === "Missing authentication token" ? "Go to Home Page" : "Back to Roll"}
        </button>
      </Link>
    </div>
  );

  return (
    <>
      <Head>
        <title>Photo #{photo_id} - In-focus</title>
        <meta name="description" content="View photo settings" />
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
            <Link href={`/user/${user_id}/rolls/${roll_id}`} style={sharedStyles.link}>Roll #{roll_id}</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Photo #{photo_id}</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Photo #{photo_id}</h1>
            {!loading && photo && (
              <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`} className={styles.linkContainer}>
                <button style={sharedStyles.button}>Edit Photo</button>
              </Link>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : !photo ? (
            <ErrorState />
          ) : (
            <div className={styles.detailsCard}>
              <h2 className={styles.title}>
                {photo.subject || "Untitled"}
              </h2>

              <div className={styles.detailsGroup}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Subject</span>
                  <p className={styles.value}>{photo.subject || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Photo URL</span>
                  {photo.photoUrl ? (
                    <a 
                      href={photo.photoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.valueLink}
                    >
                      View Photo
                    </a>
                  ) : (
                    <p className={styles.valueDisabled}>Not set</p>
                  )}
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>F-Stop</span>
                  <p className={styles.value}>f/{photo.fStop || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Focal Distance</span>
                  <p className={styles.value}>
                    {photo.focalDistance === "infinity" ? "∞" : photo.focalDistance ? `${photo.focalDistance}m` : "Not set"}
                  </p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Shutter Speed</span>
                  <p className={styles.value}>{photo.shutterSpeed || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Exposure Value</span>
                  <p className={styles.value}>{photo.exposureValue?.toString() || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Phone Light Meter</span>
                  <p className={styles.value}>{photo.phoneLightMeter || "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Stabilisation</span>
                  <p className={styles.value}>
                    {photo.stabilisation ? photo.stabilisation.charAt(0).toUpperCase() + photo.stabilisation.slice(1) : "Not set"}
                  </p>
                </div>
              </div>

              <div className={styles.booleanGroup}>
                <div className={styles.detailItem}>
                  <span className={styles.label}>Timer</span>
                  <p className={styles.value}>{typeof photo.timer === 'boolean' ? (photo.timer ? "Yes" : "No") : "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Flash</span>
                  <p className={styles.value}>{typeof photo.flash === 'boolean' ? (photo.flash ? "Yes" : "No") : "Not set"}</p>
                </div>

                <div className={styles.detailItem}>
                  <span className={styles.label}>Exposure Memory</span>
                  <p className={styles.value}>{typeof photo.exposureMemory === 'boolean' ? (photo.exposureMemory ? "Yes" : "No") : "Not set"}</p>
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Link href={`/user/${user_id}/rolls/${roll_id}`} className={styles.linkContainer}>
                  <button style={sharedStyles.secondaryButton}>
                    Back to Roll
                  </button>
                </Link>
                <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/edit`} className={styles.linkContainer}>
                  <button style={sharedStyles.button}>
                    Edit Photo
                  </button>
                </Link>
              </div>
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

export default withAuth(ViewPhotoSettingsPage);
