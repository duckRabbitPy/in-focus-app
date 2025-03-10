import { PhotoSettingsData } from "@/types/photoSettings";
import { useRouter } from "next/router";
import { useState } from "react";

export default function EditPhotoSettingsPage() {
  const router = useRouter();
  const { user_id, roll_id, photo_id } = router.query;

  // State for the form
  const [formData, setFormData] = useState<PhotoSettingsData>({
    roll_id: "1",
    photo_id: "1",
    subject: "",
    fStop: 5.6,
    focalDistance: 1,
    shutterSpeed: "1/60",
    exposureValue: 0,
    phoneLightMeter: "1/60",
    timer: false,
    flash: false,
    stabilisation: "handheld",
    exposureMemory: false,
  });

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    let newValue: unknown = value;

    if (type === "number") {
      newValue = parseFloat(value);
    } else if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user_id || !roll_id || !photo_id) return;

    try {
      const response = await fetch(
        `/api/user/${user_id}/rolls/${roll_id}/${photo_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update photo");
      }

      const result = await response.json();
      console.log("Photo updated:", result);
      // Redirect to view page
      router.push(`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`);
    } catch (error) {
      console.error("Error updating photo:", error);
      alert("Failed to update photo.");
    }
  };
  return (
    <div>
      <h1>Edit Photo</h1>
      <p>User ID: {user_id}</p>
      <p>Roll ID: {roll_id}</p>
      <p>Photo ID: {photo_id}</p>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "400px",
        }}
      >
        <label>
          Subject:
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          F-Stop:
          <select name="fStop" value={formData.fStop} onChange={handleChange}>
            {[1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22, 32].map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>

        <label>
          Focal Distance:
          <input
            type="number"
            name="focalDistance"
            value={formData.focalDistance}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, focalDistance: "infinity" })
            }
          >
            Set to Infinity
          </button>
        </label>

        <label>
          Shutter Speed:
          <select
            name="shutterSpeed"
            value={formData.shutterSpeed}
            onChange={handleChange}
          >
            {[
              "1/8000",
              "1/4000",
              "1/2000",
              "1/1000",
              "1/500",
              "1/250",
              "1/125",
              "1/60",
              "1/30",
              "1/15",
              "1/8",
              "1/4",
              "1/2",
              "1",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Exposure Value:
          <input
            type="number"
            name="exposureValue"
            value={formData.exposureValue}
            onChange={handleChange}
          />
        </label>

        <label>
          Phone Light Meter:
          <select
            name="phoneLightMeter"
            value={formData.phoneLightMeter}
            onChange={handleChange}
          >
            {[
              "1/8000",
              "1/4000",
              "1/2000",
              "1/1000",
              "1/500",
              "1/250",
              "1/125",
              "1/60",
              "1/30",
              "1/15",
              "1/8",
              "1/4",
              "1/2",
              "1",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Timer:
          <input
            type="checkbox"
            name="timer"
            checked={formData.timer}
            onChange={handleChange}
          />
        </label>

        <label>
          Flash:
          <input
            type="checkbox"
            name="flash"
            checked={formData.flash}
            onChange={handleChange}
          />
        </label>

        <label>
          Stabilisation:
          <select
            name="stabilisation"
            value={formData.stabilisation}
            onChange={handleChange}
          >
            {["handheld", "tripod", "gimbal", "other"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label>
          Exposure Memory:
          <input
            type="checkbox"
            name="exposureMemory"
            checked={formData.exposureMemory}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Save Changes</button>
      </form>

      <div
        style={{ display: "flex", flexDirection: "column", marginTop: "20px" }}
      >
        <a href={`/user/${user_id}/rolls/${roll_id}/${photo_id}/view`}>
          View photo
        </a>
        <a href={`/user/${user_id}/rolls/${roll_id}`}>Back to roll</a>
        <a href={`/user/${user_id}/rolls`}>Back to rolls</a>
        <a href={`/user/${user_id}`}>Back to user page</a>
        <a href={`/`}>Back to home</a>
      </div>
    </div>
  );
}
