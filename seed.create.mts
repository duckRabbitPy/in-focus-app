import bcrypt from "bcryptjs";
import fs from "fs";
import { faker } from "@faker-js/faker";

const TEMPLATE_PATH = "seed.template.sql";
const OUTPUT_PATH = "seed.sql";

const TAGS = [
  "portrait",
  "landscape",
  "street",
  "architecture",
  "nature",
  "night",
  "macro",
  "urban",
  "experimental",
  "black and white",
];

async function getRandomImageUrl(): Promise<string> {
  try {
    // Add a timestamp or random number as a query parameter to prevent caching
    const timestamp = new Date().getTime();
    const randomNum = Math.floor(Math.random() * 1000);
    const imageUrl = `https://picsum.photos/500/500?random=${timestamp}-${randomNum}`;
    return imageUrl;
  } catch (error) {
    console.error("Error fetching random image URL:", error);
    return "https://images.squarespace-cdn.com/content/v1/53a2b3a1e4b0a5020bebe676/1611752063818-QWUZI3W92KLAXS66EIPT/london-street-photography-00008.jpg";
  }
}

function selectTwoRandomTags(tags) {
  if (!tags || tags.length < 2) {
    throw new Error("Need at least 2 tags to select from");
  }

  const tagIndex1 = Math.floor(Math.random() * tags.length);
  const tagId1 = tagIndex1 + 1;

  let tagIndex2;
  do {
    tagIndex2 = Math.floor(Math.random() * tags.length);
  } while (tagIndex2 === tagIndex1);
  const tagId2 = tagIndex2 + 1;

  return {
    tagId1,
    tagId2,
  };
}

async function generatePhotoEntry(
  id: number,
  rollId: number,
  sequenceNumber: number
): Promise<string> {
  const photoUrl = await getRandomImageUrl();
  console.log(`Generated photo URL: ${photoUrl}`);
  const fStop = [2.8, 4, 5.6, 8, 11, 16][Math.floor(Math.random() * 6)];
  const shutterSpeed = ["1/500", "1/250", "1/125", "1/60", "1/30", "1/15"][
    Math.floor(Math.random() * 6)
  ];
  const phoneLightMeter = ["1/500", "1/250", "1/125", "1/60"][
    Math.floor(Math.random() * 4)
  ];
  const stabilisation = Math.random() > 0.5 ? "tripod" : "handheld";
  const flash = Math.random() > 0.5;
  const exposureMemory = Math.random() > 0.5;
  const focalDistance =
    Math.random() > 0.5 ? "infinity" : Math.floor(Math.random() * 10) + 1;
  const exposureValue = [1, 1.5, 2, 2.5, 3, 4][Math.floor(Math.random() * 6)];

  const subject = faker.lorem.words(3);
  const { tagId1, tagId2 } = selectTwoRandomTags(TAGS);

  return `
    -- Photo ${id}
    INSERT INTO photos (
      id, roll_id, subject, photo_url, f_stop, focal_distance, shutter_speed, exposure_value,
      phone_light_meter, stabilisation, timer, flash, exposure_memory, notes, sequence_number
    ) VALUES (
      ${id}, ${rollId}, '${subject}', '${photoUrl}', ${fStop}, '${focalDistance}', '${shutterSpeed}', ${exposureValue},
      '${phoneLightMeter}', '${stabilisation}', false, ${flash}, ${exposureMemory}, 'Test photo ${id}', ${sequenceNumber}
    );

    -- Photo tags associations
    INSERT INTO photo_tags (photo_id, tag_id) VALUES
      (${id}, ${tagId1}),
      (${id}, ${tagId2});
  `;
}

async function main() {
  const password = process.env.TEST_USER_PASSWORD;
  if (!password) {
    console.error("❌ TEST_USER_PASSWORD not set in .env");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const outputWithPassword = template.replace(
    "$TEST_USER_HASHED_PASSWORD_PLACEHOLDER",
    hash
  );

  const NUM_PHOTOS = 1000;

  // Add test photos
  let photoEntries = "";
  const rollId = 1;
  let sequenceNumber = 1;

  for (let i = 1; i <= NUM_PHOTOS; i++) {
    photoEntries += await generatePhotoEntry(i, rollId, sequenceNumber);
    sequenceNumber++;
  }

  const outputWithPhotos = outputWithPassword.replace(
    "-- [SCRIPT INSERT TEST PHOTOS]",
    photoEntries
  );

  const finalOutput = outputWithPhotos.replace(
    "-- [SCRIPT INSERT SEQUENCE VALUES]",
    `
    SELECT setval('rolls_id_seq', ${rollId});
    SELECT setval('photos_id_seq', ${NUM_PHOTOS + 1});
  `
  );

  fs.writeFileSync(OUTPUT_PATH, finalOutput);
  console.log(`✅ Wrote ${OUTPUT_PATH} with hashed TEST_USER_PASSWORD`);
}

main();
