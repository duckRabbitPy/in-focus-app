import { PhotoSettingsData, FStop, ShutterSpeed, Stabilisation } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import { withAuth } from "@/utils/withAuth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const formStyles = {
  group: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    marginBottom: '1rem',
    width: '100%',
    '@media (min-width: 640px)': {
      marginBottom: '1.5rem',
    },
  },
  label: {
    fontSize: '0.85rem',
    color: '#333',
    fontFamily: 'var(--font-geist-sans)',
    '@media (min-width: 640px)': {
      fontSize: '0.9rem',
    },
  },
  select: {
    ...sharedStyles.input,
    backgroundColor: '#fff',
    width: '100%',
    paddingRight: '2rem',
  },
  checkbox: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem',
    borderRadius: '4px',
    '&:active': {
      backgroundColor: '#f5f5f5',
    },
  },
  checkboxInput: {
    width: '1.4rem',
    height: '1.4rem',
    cursor: 'pointer',
    '@media (min-width: 640px)': {
      width: '1.2rem',
      height: '1.2rem',
    },
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginTop: '1.5rem',
    width: '100%',
    '@media (min-width: 640px)': {
      flexDirection: 'row',
      gap: '1rem',
      marginTop: '2rem',
    },
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '0.5rem',
    marginTop: '1rem',
    width: '100%',
    '@media (min-width: 480px)': {
      gridTemplateColumns: '1fr 1fr',
    },
  },
  inputWithButton: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
    width: '100%',
    '@media (min-width: 640px)': {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
  },
  segmentedControl: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '0.5rem',
  },
  segment: {
    padding: '0.5rem 1rem',
    border: '1px solid #e5e5e5',
    borderRadius: '4px',
    fontSize: '0.9rem',
    cursor: 'pointer',
    backgroundColor: '#fff',
    color: '#666',
    flex: 1,
    textAlign: 'center' as const,
  },
  activeSegment: {
    backgroundColor: '#0070f3',
    color: '#fff',
    borderColor: '#0070f3',
  },
};

function EditPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  const [photo, setPhoto] = useState<PhotoSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user_id || !roll_id || !photo_id) return;

    fetch(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
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
      .catch((error: Error) => {
        console.error('Failed to load photo data:', error);
        setError("Failed to load photo data");
        setPhoto(null);
        setLoading(false);
      });
  }, [user_id, roll_id, photo_id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/user/${user_id}/rolls/${roll_id}/${photo_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(photo)
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        router.push(`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`);
      }
    } catch (error: unknown) {
      console.error('Failed to save changes:', error);
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const LoadingState = () => (
    <div style={{textAlign: 'center', padding: '2rem'}}>
      <p style={sharedStyles.subtitle}>Loading...</p>
    </div>
  );

  const ErrorState = () => (
    <div style={{textAlign: 'center', padding: '2rem'}}>
      <p style={sharedStyles.error}>
        {error === "Missing authentication token" ? 
          "Please log in to edit this page" : 
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
        <title>Edit Photo #{photo_id} - In-focus</title>
        <meta name="description" content="Edit photo settings" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={sharedStyles.page}
      >
        <main style={sharedStyles.main}>
          <div style={sharedStyles.breadcrumbs}>
            <Link href={`/user/${user_id}`} style={sharedStyles.link}>Account</Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls`} style={sharedStyles.link}>Rolls</Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls/${roll_id}`} style={sharedStyles.link}>Roll #{roll_id}</Link>
            <span style={sharedStyles.separator}>/</span>
            <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`} style={sharedStyles.link}>Photo #{photo_id}</Link>
            <span style={sharedStyles.separator}>/</span>
            <span>Edit</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Edit Photo #{photo_id}</h1>
          </div>

          {loading ? (
            <LoadingState />
          ) : !photo ? (
            <ErrorState />
          ) : (
            <form onSubmit={handleSubmit}>
              <div style={{...sharedStyles.card, cursor: 'default'}}>
                {error && <p style={sharedStyles.error}>{error}</p>}
                
                <div style={formStyles.group}>
                  <label style={formStyles.label}>Subject</label>
                  <input
                    type="text"
                    name="subject"
                    value={photo.subject}
                    onChange={(e) => setPhoto({ ...photo, subject: e.target.value })}
                    style={sharedStyles.input}
                    required
                  />
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Photo URL</label>
                  <input
                    type="url"
                    name="photo_url"
                    value={photo.photo_url || ''}
                    onChange={(e) => setPhoto({ ...photo, photo_url: e.target.value })}
                    style={sharedStyles.input}
                    placeholder="https://example.com/photo.jpg"
                  />
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>F-Stop</label>
                  <select 
                    name="f_stop" 
                    value={photo.f_stop} 
                    onChange={(e) => setPhoto({ ...photo, f_stop: parseFloat(e.target.value) as FStop })}
                    style={formStyles.select}
                  >
                    {[1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Focal Distance</label>
                  <div style={formStyles.segmentedControl}>
                    <button
                      type="button"
                      onClick={() => setPhoto({ ...photo, focal_distance: photo.focal_distance === "infinity" ? 1 : photo.focal_distance as number })}
                      style={{
                        ...formStyles.segment,
                        ...(photo.focal_distance !== "infinity" ? formStyles.activeSegment : {})
                      }}
                    >
                      Meters
                    </button>
                    <button
                      type="button"
                      onClick={() => setPhoto({ ...photo, focal_distance: "infinity" })}
                      style={{
                        ...formStyles.segment,
                        ...(photo.focal_distance === "infinity" ? formStyles.activeSegment : {})
                      }}
                    >
                      Infinity (∞)
                    </button>
                  </div>
                  {photo.focal_distance !== "infinity" && (
                    <input
                      type="number"
                      name="focal_distance"
                      value={photo.focal_distance}
                      onChange={(e) => setPhoto({ ...photo, focal_distance: parseFloat(e.target.value) })}
                      style={sharedStyles.input}
                      min="0.1"
                      step="0.1"
                    />
                  )}
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Shutter Speed</label>
                  <select
                    name="shutter_speed"
                    value={photo.shutter_speed}
                    onChange={(e) => setPhoto({ ...photo, shutter_speed: e.target.value as ShutterSpeed })}
                    style={formStyles.select}
                  >
                    {["1/8000", "1/4000", "1/2000", "1/1000", "1/500", "1/250", "1/125", "1/60", "1/30", "1/15", "1/8", "1/4", "1/2", "1"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Exposure Value</label>
                  <input
                    type="number"
                    name="exposure_value"
                    value={photo.exposure_value}
                    onChange={(e) => setPhoto({ ...photo, exposure_value: parseFloat(e.target.value) })}
                    style={sharedStyles.input}
                  />
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Phone Light Meter</label>
                  <select
                    name="phone_light_meter"
                    value={photo.phone_light_meter}
                    onChange={(e) => setPhoto({ ...photo, phone_light_meter: e.target.value as ShutterSpeed })}
                    style={formStyles.select}
                  >
                    {["1/8000", "1/4000", "1/2000", "1/1000", "1/500", "1/250", "1/125", "1/60", "1/30", "1/15", "1/8", "1/4", "1/2", "1"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={formStyles.group}>
                  <label style={formStyles.label}>Stabilisation</label>
                  <select
                    name="stabilisation"
                    value={photo.stabilisation}
                    onChange={(e) => setPhoto({ ...photo, stabilisation: e.target.value as Stabilisation })}
                    style={formStyles.select}
                  >
                    {["handheld", "tripod", "gimbal", "other"].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div style={formStyles.checkboxGrid}>
                  <div style={formStyles.checkbox}>
                    <input
                      type="checkbox"
                      name="timer"
                      checked={photo.timer}
                      onChange={(e) => setPhoto({ ...photo, timer: e.target.checked })}
                      style={formStyles.checkboxInput}
                    />
                    <label style={formStyles.label}>Timer</label>
                  </div>

                  <div style={formStyles.checkbox}>
                    <input
                      type="checkbox"
                      name="flash"
                      checked={photo.flash}
                      onChange={(e) => setPhoto({ ...photo, flash: e.target.checked })}
                      style={formStyles.checkboxInput}
                    />
                    <label style={formStyles.label}>Flash</label>
                  </div>

                  <div style={formStyles.checkbox}>
                    <input
                      type="checkbox"
                      name="exposure_memory"
                      checked={photo.exposure_memory}
                      onChange={(e) => setPhoto({ ...photo, exposure_memory: e.target.checked })}
                      style={formStyles.checkboxInput}
                    />
                    <label style={formStyles.label}>Exposure Memory</label>
                  </div>
                </div>

                <div style={formStyles.buttonGroup}>
                  <Link href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}>
                    <button type="button" style={sharedStyles.secondaryButton}>
                      Cancel
                    </button>
                  </Link>
                  <button 
                    type="submit" 
                    style={sharedStyles.button}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </form>
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

export default withAuth(EditPhotoSettingsPage);
