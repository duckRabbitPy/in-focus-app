export type FStop = 1.4 | 2 | 2.8 | 4 | 5.6 | 8 | 11 | 16 | 22 | 32;
export type ShutterSpeed =
  | "1/8000"
  | "1/4000"
  | "1/2000"
  | "1/1000"
  | "1/500"
  | "1/250"
  | "1/125"
  | "1/60"
  | "1/30"
  | "1/15"
  | "1/8"
  | "1/4"
  | "1/2"
  | "1";
export type PhoneLightMeter = ShutterSpeed; // Assuming same values as shutter speed
export type Stabilisation = "handheld" | "tripod" | "gimbal" | "other";

export interface PhotoSettingsData {
  roll_id: string;
  photo_id: string;
  subject: string;
  photoUrl?: string;
  fStop: FStop;
  focalDistance: number | "infinity";
  shutterSpeed: ShutterSpeed;
  exposureValue: number;
  phoneLightMeter: PhoneLightMeter;
  timer: boolean;
  flash: boolean;
  stabilisation: Stabilisation;
  exposureMemory: boolean;
}
