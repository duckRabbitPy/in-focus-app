import {
  FstopSchema,
  PhoneLightMeterSchema,
  ShutterSpeedSchema,
  StabilisationSchema,
  FullPhotoSettingsData,
} from "@/types/photoSettings";
import { sharedStyles } from "@/styles/shared";
import { useRouter } from "next/router";
import TagPicker from "../TagPicker";
import LensPicker from "../LensPicker";
import { formStyles } from "./PhotoForm.styles";
import {
  FstopOptions,
  PhoneLightMeterOptions,
  ShutterSpeedOptions,
  StabilisationOptions,
} from "./constants";

type NewPhotoData = Omit<
  FullPhotoSettingsData,
  "created_at" | "updated_at" | "id"
>;

interface PhotoFormProps<T extends boolean> {
  photo: T extends true
    ? Omit<FullPhotoSettingsData, "id" | "created_at" | "updated_at">
    : FullPhotoSettingsData;
  onPhotoChange: (
    photo: T extends true ? NewPhotoData : FullPhotoSettingsData
  ) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitButtonText: string;
  cancelHref: string;
  error?: string;
  isSubmitting?: boolean;
  isNewPhoto: T;
}

export default function PhotoForm<T extends boolean>({
  photo,
  onPhotoChange,
  onSubmit,
  submitButtonText,
  cancelHref,
  error,
  isSubmitting = false,
}: PhotoFormProps<T>) {
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
            onChange={(e) => {
              onPhotoChange({
                ...photo,
                f_stop: FstopSchema.parse(e.target.value),
              });
            }}
            style={formStyles.select}
          >
            {FstopOptions.map((f) => (
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
                      : photo.focal_distance,
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
              max="100"
            />
          )}
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Shutter Speed</label>
          <select
            name="shutter_speed"
            value={photo.shutter_speed}
            onChange={(e) => {
              onPhotoChange({
                ...photo,
                shutter_speed: ShutterSpeedSchema.parse(e.target.value),
              });
            }}
            style={formStyles.select}
          >
            {ShutterSpeedOptions.map((shutterSpeed) => (
              <option key={shutterSpeed} value={shutterSpeed}>
                {shutterSpeed}
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
              max={photo.exposure_value < 0 ? 99.9 : 100}
            />
          </div>
        </div>

        <div style={formStyles.group}>
          <label style={formStyles.label}>Phone Light Meter</label>
          <select
            name="phone_light_meter"
            value={photo.phone_light_meter}
            onChange={(e) => {
              onPhotoChange({
                ...photo,
                phone_light_meter: PhoneLightMeterSchema.parse(e.target.value),
              });
            }}
            style={formStyles.select}
          >
            {PhoneLightMeterOptions.map((s) => (
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
            onChange={(e) => {
              onPhotoChange({
                ...photo,
                stabilisation: StabilisationSchema.parse(e.target.value),
              });
            }}
            style={formStyles.select}
          >
            {StabilisationOptions.map((s) => (
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
