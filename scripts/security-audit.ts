import fs from "fs";
import path from "path";
import chalk from "chalk";

const USER_PAGES_DIR = path.resolve("src/pages/user");

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

function checkFileForWithAuthExport(filePath: string): boolean {
  const content = fs.readFileSync(filePath, "utf-8");
  return content.includes("export default withAuth(");
}

function main() {
  const files = findAllTsxFiles(USER_PAGES_DIR);
  const unprotectedFiles: string[] = [];

  files.forEach((file) => {
    if (!checkFileForWithAuthExport(file)) {
      unprotectedFiles.push(file);
    }
  });

  if (unprotectedFiles.length > 0) {
    unprotectedFiles.forEach((file) => {
      console.log(
        chalk.red(
          `⚠️  Unprotected user page: ${path.relative(process.cwd(), file)}`
        )
      );
    });
    process.exitCode = 1;
  } else {
    console.log(chalk.green("✅ All user pages are protected with withAuth."));
  }
}

main();
