import { z } from "zod";

// support numbers and strings for fstop TODO: fix this
export const FstopSchema = z.union([
  z.literal("1.4"),
  z.literal("1.7"),
  z.literal("2"),
  z.literal("2.5"),
  z.literal("2.8"),
  z.literal("4"),
  z.literal("5.6"),
  z.literal("8"),
  z.literal("11"),
  z.literal("16"),
  z.literal("22"),
  z.literal("32"),
]);

export const ShutterSpeedSchema = z.union([
  z.literal("8"),
  z.literal("4"),
  z.literal("2"),
  z.literal("1"),
  z.literal("1/2"),
  z.literal("1/4"),
  z.literal("1/8"),
  z.literal("1/15"),
  z.literal("1/30"),
  z.literal("1/60"),
  z.literal("1/125"),
  z.literal("1/250"),
  z.literal("1/500"),
  z.literal("1/1000"),
  z.literal("1/2000"),
  z.literal("1/4000"),
  z.literal("1/8000"),
]);

export const PhoneLightMeterSchema = ShutterSpeedSchema;

export const StabilisationSchema = z.union([
  z.literal("handheld"),
  z.literal("rested"),
  z.literal("tripod"),
]);

export const PhotoSchema = z.object({
  id: z.number(),
  roll_id: z.number(),
  photo_url: z.string(),
  subject: z.string(),
  f_stop: FstopSchema,
  focal_distance: z.union([z.string().regex(/^\d+$/), z.literal("infinity")]),
  shutter_speed: ShutterSpeedSchema,
  exposure_value: z.preprocess((val) => Number(val), z.number()),
  phone_light_meter: PhoneLightMeterSchema,
  timer: z.boolean(),
  flash: z.boolean(),
  stabilisation: StabilisationSchema,
  exposure_memory: z.boolean(),
  lens: z.string().nullable(),
  tags: z.array(z.string()),
  notes: z.string().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

export type Fstop = z.infer<typeof FstopSchema>;

export type AllPhotoSettings = z.infer<typeof PhotoSchema>;

export type PhotoSettingsFormData = Omit<AllPhotoSettings, "id">;
