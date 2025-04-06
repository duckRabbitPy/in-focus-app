import { loadEnvConfig } from "@next/env";

// Load environment variables before tests
const projectDir = process.cwd();
loadEnvConfig(projectDir);
