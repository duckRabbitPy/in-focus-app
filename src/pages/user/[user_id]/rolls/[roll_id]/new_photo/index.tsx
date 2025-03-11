import { PhotoSettingsData, FStop, ShutterSpeed, Stabilisation } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useState } from "react";
import { sharedStyles } from "@/styles/shared";
import Link from "next/link";
import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
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
};

const initialPhotoState: Partial<PhotoSettingsData> = {
  subject: "",
  photoUrl: "",
  fStop: 2.8,
  focalDistance: 1,
  shutterSpeed: "1/125",
  exposureValue: 0,
  phoneLightMeter: "1/125",
  stabilisation: "handheld",
  timer: false,
  flash: false,
  exposureMemory: false,
};

function NewPhotoPage() {
  const router = useRouter();
  const { user_id, roll_id } = router.query;
  const [photo, setPhoto] = useState<PhotoSettingsData>(initialPhotoState as PhotoSettingsData);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetchWithAuth(`/api/user/${user_id}/rolls/${roll_id}/photos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(photo),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create photo');
      }

      router.push(`/user/${user_id}/rolls/${roll_id}`);
    } catch (err) {
      console.error('Error creating photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to create photo');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Head>
        <title>New Photo - In-focus</title>
        <meta name="description" content="Add a new photo to your roll" />
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
            <span>New Photo</span>
          </div>

          <div style={sharedStyles.header}>
            <h1 style={sharedStyles.title}>Add New Photo</h1>
          </div>

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
                  name="photoUrl"
                  value={photo.photoUrl}
                  onChange={(e) => setPhoto({ ...photo, photoUrl: e.target.value })}
                  style={sharedStyles.input}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>

              <div style={formStyles.group}>
                <label style={formStyles.label}>F-Stop</label>
                <select 
                  name="fStop" 
                  value={photo.fStop} 
                  onChange={(e) => setPhoto({ ...photo, fStop: parseFloat(e.target.value) as FStop })}
                  style={formStyles.select}
                >
                  {[1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div style={formStyles.group}>
                <label style={formStyles.label}>Focal Distance (m)</label>
                <div style={formStyles.inputWithButton}>
                  <input
                    type="number"
                    name="focalDistance"
                    value={photo.focalDistance}
                    onChange={(e) => setPhoto({ ...photo, focalDistance: parseFloat(e.target.value) })}
                    style={sharedStyles.input}
                  />
                  <button
                    type="button"
                    onClick={() => setPhoto({ ...photo, focalDistance: "infinity" })}
                    style={{...sharedStyles.secondaryButton, minWidth: '44px'}}
                  >
                    ∞
                  </button>
                </div>
              </div>

              <div style={formStyles.group}>
                <label style={formStyles.label}>Shutter Speed</label>
                <select
                  name="shutterSpeed"
                  value={photo.shutterSpeed}
                  onChange={(e) => setPhoto({ ...photo, shutterSpeed: e.target.value as ShutterSpeed })}
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
                  name="exposureValue"
                  value={photo.exposureValue}
                  onChange={(e) => setPhoto({ ...photo, exposureValue: parseFloat(e.target.value) })}
                  style={sharedStyles.input}
                />
              </div>

              <div style={formStyles.group}>
                <label style={formStyles.label}>Phone Light Meter</label>
                <select
                  name="phoneLightMeter"
                  value={photo.phoneLightMeter}
                  onChange={(e) => setPhoto({ ...photo, phoneLightMeter: e.target.value as ShutterSpeed })}
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
                    name="exposureMemory"
                    checked={photo.exposureMemory}
                    onChange={(e) => setPhoto({ ...photo, exposureMemory: e.target.checked })}
                    style={formStyles.checkboxInput}
                  />
                  <label style={formStyles.label}>Exposure Memory</label>
                </div>
              </div>

              <div style={formStyles.buttonGroup}>
                <Link href={`/user/${user_id}/rolls/${roll_id}`}>
                  <button type="button" style={sharedStyles.secondaryButton}>
                    Cancel
                  </button>
                </Link>
                <button 
                  type="submit" 
                  style={sharedStyles.button}
                  disabled={saving}
                >
                  {saving ? "Creating..." : "Create Photo"}
                </button>
              </div>
            </div>
          </form>
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

export default withAuth(NewPhotoPage);
