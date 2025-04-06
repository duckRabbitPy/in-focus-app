import fs from "fs";
import path from "path";
import chalk from "chalk";

const USER_PAGES_DIR = path.resolve("src/pages/user");
const USER_API_DIR = path.resolve("src/pages/api/user");

function findAllTsxFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findAllTsxFiles(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      return [fullPath];
    }
    return [];
  });
}

function findAllApiFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  return entries.flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return findAllApiFiles(fullPath);
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".ts") &&
      !entry.name.includes(".test.") &&
      !entry.name.includes(".spec.")
    ) {
      return [fullPath];
    }
    return [];
  });
}

function checkFileForWithAuthExport(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.includes("export default withAuth(");
}

function checkFileForWithApiAuthMiddleware(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.includes("export default WithApiAuthMiddleware(");
}

function main() {
  // Check client pages
  const clientFiles = findAllTsxFiles(USER_PAGES_DIR);
  const unprotectedClientFiles: string[] = [];

  clientFiles.forEach((file) => {
    if (!checkFileForWithAuthExport(file)) {
      unprotectedClientFiles.push(file);
    }
  });

  // Check API routes
  const apiFiles = findAllApiFiles(USER_API_DIR);
  const unprotectedApiFiles: string[] = [];

  apiFiles.forEach((file) => {
    if (!checkFileForWithApiAuthMiddleware(file)) {
      unprotectedApiFiles.push(file);
    }
  });

  let hasError = false;

  if (unprotectedClientFiles.length > 0) {
    console.log(chalk.yellow("⚠️  Unprotected client pages:"));
    unprotectedClientFiles.forEach((file) => {
      console.log(chalk.red(`    ${path.relative(process.cwd(), file)}`));
    });
    hasError = true;
  } else {
    console.log(chalk.green("✅ All user pages are protected with withAuth."));
  }

  if (unprotectedApiFiles.length > 0) {
    console.log(chalk.yellow("⚠️  Unprotected API routes:"));
    unprotectedApiFiles.forEach((file) => {
      console.log(chalk.red(`    ${path.relative(process.cwd(), file)}`));
    });
    hasError = true;
  } else {
    console.log(
      chalk.green("✅ All API routes are protected with WithApiAuthMiddleware.")
    );
  }

  if (hasError) {
    process.exitCode = 1;
  }
}

main();
