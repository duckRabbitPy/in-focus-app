import bcrypt from "bcryptjs";
import fs from "fs";

const TEMPLATE_PATH = "seed.template.sql";
const OUTPUT_PATH = "seed.sql";

async function main() {
  const password = process.env.TEST_USER_PASSWORD;
  if (!password) {
    console.error("❌ TEST_USER_PASSWORD not set in .env");
    process.exit(1);
  }

  const hash = await bcrypt.hash(password, 12);

  const template = fs.readFileSync(TEMPLATE_PATH, "utf8");
  const output = template.replace(
    "$TEST_USER_HASHED_PASSWORD_PLACEHOLDER",
    hash
  );

  fs.writeFileSync(OUTPUT_PATH, output);
  console.log(`✅ Wrote ${OUTPUT_PATH} with hashed TEST_USER_PASSWORD`);
}

main();
