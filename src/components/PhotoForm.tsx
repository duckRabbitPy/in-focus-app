import {
  FStop,
  ShutterSpeed,
  Stabilisation,
  PhotoSettingsFormData,
} from "@/types/photoSettings";
import { sharedStyles } from "@/styles/shared";
import { useRouter } from "next/router";
import TagPicker from "./TagPicker";
import LensPicker from "./LensPicker";

export const formStyles = {
  group: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.5rem",
    marginTop: "1rem",
    marginBottom: "1rem",
    width: "100%",
    "@media (minWidth: 640px)": {
      marginBottom: "1.5rem",
    },
  },
  label: {
    fontSize: "0.85rem",
    color: "#333",
    fontFamily: "var(--font-geist-sans)",
    "@media (minWidth: 640px)": {
      fontSize: "0.9rem",
    },
  },
  select: {
    ...sharedStyles.input,
    backgroundColor: "#fff",
    width: "100%",
    paddingRight: "2rem",
  },
  checkbox: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.5rem",
    borderRadius: "4px",
    "&:active": {
      backgroundColor: "#f5f5f5",
    },
  },
  checkboxInput: {
    width: "1.4rem",
    height: "1.4rem",
    cursor: "pointer",
    "@media (minWidth: 640px)": {
      width: "1.2rem",
      height: "1.2rem",
    },
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.75rem",
    marginTop: "1.5rem",
    width: "100%",
    "@media (minWidth: 640px)": {
      flexDirection: "row",
      gap: "1rem",
      marginTop: "2rem",
    },
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "0.5rem",
    marginTop: "1rem",
    width: "100%",
    "@media (minWidth: 480px)": {
      gridTemplateColumns: "1fr 1fr",
    },
  },
  segmentedControl: {
    display: "flex",
    gap: "0.5rem",
    marginBottom: "0.5rem",
  },
  segment: {
    padding: "0.5rem 1rem",
    border: "1px solid #e5e5e5",
    borderRadius: "4px",
    fontSize: "0.9rem",
    cursor: "pointer",
    backgroundColor: "#fff",
    color: "#666",
    flex: 1,
    textAlign: "center" as const,
  },
  activeSegment: {
    backgroundColor: "#8E5D94",
    color: "#fff",
    borderColor: "#8E5D94",
  },
};

interface PhotoFormProps {
  photo: PhotoSettingsFormData;
  onPhotoChange: (photo: PhotoSettingsFormData) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitButtonText: string;
  cancelHref: string;
  error?: string;
  isSubmitting?: boolean;
}

export default function PhotoForm({
  photo,
  onPhotoChange,
  onSubmit,
  submitButtonText,
  cancelHref,
  error,
  isSubmitting = false,
}: PhotoFormProps) {
  const router = useRouter();
  const { user_id } = router.query;

  if (!user_id || Array.isArray(user_id)) {
    return <p style={sharedStyles.error}>Invalid user ID</p>;
  }

  return (
    <form onSubmit={onSubmit}>
      <div style={{ ...sharedStyles.card, cursor: "default" }}>
        {error && <p style={sharedStyles.error}>{error}</p>}

        <div style={formStyles.group}>
          <label style={formStyles.label}>Subject</label>
          <input
            type="text"
            name="subject"
            value={photo.subject}
            onChange={(e) =>
              onPhotoChange({ ...photo, subject: e.target.value })
            }
            style={sharedStyles.input}
            required
          />
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Photo URL</label>
          <input
            type="url"
            name="photo_url"
            value={photo.photo_url || ""}
            onChange={(e) =>
              onPhotoChange({ ...photo, photo_url: e.target.value })
            }
            style={sharedStyles.input}
          />
        </div>

        <TagPicker
          selectedTags={photo.tags || []}
          onTagsChange={(tags) => onPhotoChange({ ...photo, tags })}
          userId={user_id}
        />

        <div style={formStyles.group}>
          <label style={formStyles.label}>F-Stop</label>
          <select
            name="f_stop"
            value={photo.f_stop}
            onChange={(e) =>
              onPhotoChange({
                ...photo,
                f_stop: parseFloat(e.target.value) as FStop,
              })
            }
            style={formStyles.select}
          >
            {[1.4, 1.7, 2, 2.5, 2.8, 4, 5.6, 8, 11, 16, 22, 32].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.group}>
          <LensPicker
            selectedLenses={photo.lens ? [photo.lens] : []}
            onLensesChange={(lenses) =>
              onPhotoChange({ ...photo, lens: lenses[0] })
            }
            userId={user_id}
          />

          <label style={formStyles.label}>Focal Distance</label>
          <div style={formStyles.segmentedControl}>
            <button
              type="button"
              onClick={() =>
                onPhotoChange({
                  ...photo,
                  focal_distance:
                    photo.focal_distance === "infinity"
                      ? 1
                      : (photo.focal_distance as number),
                })
              }
              style={{
                ...formStyles.segment,
                ...(photo.focal_distance !== "infinity"
                  ? formStyles.activeSegment
                  : {}),
              }}
            >
              Meters
            </button>
            <button
              type="button"
              onClick={() =>
                onPhotoChange({ ...photo, focal_distance: "infinity" })
              }
              style={{
                ...formStyles.segment,
                ...(photo.focal_distance === "infinity"
                  ? formStyles.activeSegment
                  : {}),
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
              onChange={(e) =>
                onPhotoChange({
                  ...photo,
                  focal_distance: parseFloat(e.target.value),
                })
              }
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
            onChange={(e) =>
              onPhotoChange({
                ...photo,
                shutter_speed: e.target.value as ShutterSpeed,
              })
            }
            style={formStyles.select}
          >
            {[
              "8",
              "4",
              "2",
              "1",
              "1/2",
              "1/4",
              "1/8",
              "1/15",
              "1/30",
              "1/60",
              "1/125",
              "1/250",
              "1/500",
              "1/1000",
              "1/2000",
              "1/4000",
              "1/8000",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Exposure Value</label>
          <div
            style={{
              ...formStyles.segmentedControl,
              justifyContent: "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <button
              type="button"
              onClick={() =>
                onPhotoChange({
                  ...photo,
                  exposure_value: Math.abs(photo.exposure_value),
                })
              }
              style={{
                ...formStyles.segment,
                ...(photo.exposure_value >= 0 ? formStyles.activeSegment : {}),
                width: "44px",
                height: "44px",
                flex: "0 0 auto",
                fontSize: "1.5rem",
                fontWeight: 500,
                padding: "0.5rem 0",
              }}
            >
              +
            </button>
            <button
              type="button"
              onClick={() =>
                onPhotoChange({
                  ...photo,
                  exposure_value: Math.abs(photo.exposure_value) * -1,
                })
              }
              style={{
                ...formStyles.segment,
                ...(photo.exposure_value < 0 ? formStyles.activeSegment : {}),
                minWidth: "3rem",
                flex: "0 0 auto",
                fontSize: "1.25rem",
                fontWeight: 500,
                padding: "0.5rem 0",
                width: "44px",
                height: "44px",
              }}
            >
              −
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="number"
              name="exposure_value"
              value={Math.abs(photo.exposure_value)}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                onPhotoChange({
                  ...photo,
                  exposure_value: photo.exposure_value < 0 ? -value : value,
                });
              }}
              style={{ ...sharedStyles.input, flex: 1 }}
              min="0"
              step="0.5"
            />
          </div>
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Phone Light Meter</label>
          <select
            name="phone_light_meter"
            value={photo.phone_light_meter}
            onChange={(e) =>
              onPhotoChange({
                ...photo,
                phone_light_meter: e.target.value as ShutterSpeed,
              })
            }
            style={formStyles.select}
          >
            {[
              "8",
              "4",
              "2",
              "1",
              "1/2",
              "1/4",
              "1/8",
              "1/15",
              "1/30",
              "1/60",
              "1/125",
              "1/250",
              "1/500",
              "1/1000",
              "1/2000",
              "1/4000",
              "1/8000",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Stabilisation</label>
          <select
            name="stabilisation"
            value={photo.stabilisation}
            onChange={(e) =>
              onPhotoChange({
                ...photo,
                stabilisation: e.target.value as Stabilisation,
              })
            }
            style={formStyles.select}
          >
            {["handheld", "rested", "tripod"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div style={formStyles.checkboxGrid}>
          <div style={formStyles.checkbox}>
            <input
              type="checkbox"
              name="timer"
              checked={photo.timer}
              onChange={(e) =>
                onPhotoChange({ ...photo, timer: e.target.checked })
              }
              style={formStyles.checkboxInput}
            />
            <label style={formStyles.label}>Timer</label>
          </div>

          <div style={formStyles.checkbox}>
            <input
              type="checkbox"
              name="flash"
              checked={photo.flash}
              onChange={(e) =>
                onPhotoChange({ ...photo, flash: e.target.checked })
              }
              style={formStyles.checkboxInput}
            />
            <label style={formStyles.label}>Flash</label>
          </div>

          <div style={formStyles.checkbox}>
            <input
              type="checkbox"
              name="exposure_memory"
              checked={photo.exposure_memory}
              onChange={(e) =>
                onPhotoChange({ ...photo, exposure_memory: e.target.checked })
              }
              style={formStyles.checkboxInput}
            />
            <label style={formStyles.label}>Exposure Memory</label>
          </div>
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Notes</label>
          <textarea
            name="notes"
            value={photo.notes || ""}
            onChange={(e) => onPhotoChange({ ...photo, notes: e.target.value })}
            style={{
              ...sharedStyles.input,
              minHeight: "100px",
              resize: "vertical",
            }}
            placeholder="Add any notes about this photo..."
          />
        </div>

        <div style={formStyles.buttonGroup}>
          <button
            type="submit"
            style={sharedStyles.button}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : submitButtonText}
          </button>
          <a href={cancelHref}>
            <button type="button" style={sharedStyles.secondaryButton}>
              Cancel
            </button>
          </a>
        </div>
      </div>
    </form>
  );
}
