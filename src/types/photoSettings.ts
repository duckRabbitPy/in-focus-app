import { z } from "zod";

export type FStop = 1.4 | 2 | 2.8 | 4 | 5.6 | 8 | 11 | 16 | 22 | 32;
export type ShutterSpeed =
  | "8"
  | "4"
  | "2"
  | "1"
  | "1/2"
  | "1/4"
  | "1/8"
  | "1/15"
  | "1/30"
  | "1/60"
  | "1/125"
  | "1/250"
  | "1/500"
  | "1/1000"
  | "1/2000"
  | "1/4000"
  | "1/8000";
export type PhoneLightMeter = ShutterSpeed; // Assuming same values as shutter speed
export type Stabilisation = "handheld" | "rested" | "tripod";

// Base type with all shared fields
export interface BasePhotoSettings {
  roll_id: string;
  subject: string;
  photo_url?: string;
  f_stop: FStop;
  focal_distance: number | "infinity";
  shutter_speed: ShutterSpeed;
  exposure_value: number;
  phone_light_meter: PhoneLightMeter;
  timer: boolean;
  flash: boolean;
  stabilisation: Stabilisation;
  exposure_memory: boolean;
  notes?: string;
}
export type FStop = 1.4 | 2 | 2.8 | 4 | 5.6 | 8 | 11 | 16 | 22 | 32;
// Full data type with required photo_id
export interface PhotoSettingsData {
  roll_id: number;
  photo_id: number;
  subject: string;
  photo_url?: string;
  f_stop: FStop;
  focal_distance: number | "infinity";
  shutter_speed: ShutterSpeed;
  exposure_value: number;
  phone_light_meter: PhoneLightMeter;
  timer: boolean;
  flash: boolean;
  stabilisation: Stabilisation;
  exposure_memory: boolean;
  notes?: string;
  tags: string[];
  lens: string;
}

export const PhotoSchema = z.object({
  id: z.number(),
  roll_id: z.number(),
  photo_url: z.string(),
  subject: z.string(),
  f_stop: z.number(),
  focal_distance: z.string(),
  shutter_speed: z.string(),
  exposure_value: z.string(),
  phone_light_meter: z.string(),
  timer: z.string(),
  flash: z.string(),
  stabilisation: z.string(),
  exposure_memory: z.string(),
  lens: z.string(),
  tags: z.string(),
  notes: z.string(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type PhotoSettingsDataZod = z.infer<typeof PhotoSchema>;

// Form data type - same as PhotoSettingsData but without photo_id
export type PhotoSettingsFormData = {
  [K in keyof Omit<PhotoSettingsData, "photo_id">]: PhotoSettingsData[K];
};
