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

// Full data type with required photo_id
export interface PhotoSettingsData {
  roll_id: string;
  photo_id: string;
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

// Form data type - same as PhotoSettingsData but without photo_id
export type PhotoSettingsFormData = {
  [K in keyof Omit<PhotoSettingsData, "photo_id">]: PhotoSettingsData[K];
};
