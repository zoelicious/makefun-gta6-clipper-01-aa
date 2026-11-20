import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const videoPath = join(repoRoot, "VIDEO.json");

const outputDir = process.env.MAKEFUN_OUTPUT_DIR;
if (!outputDir) {
  throw new Error("MAKEFUN_OUTPUT_DIR is not set");
}

const raw = readFileSync(videoPath, "utf8");

let data: unknown;
try {
  data = JSON.parse(raw);
} catch {
  throw new Error("VIDEO.json is not valid JSON");
}

if (typeof data !== "object" || data === null || Array.isArray(data)) {
  throw new Error("VIDEO.json must be a JSON object");
}

const url = (data as { url?: unknown }).url;
if (typeof url !== "string" || url.length === 0) {
  throw new Error('VIDEO.json must have a non-empty string "url"');
}

const shortsPattern = /^https:\/\/www\.youtube\.com\/shorts\/([A-Za-z0-9_-]{11})$/;
if (!shortsPattern.test(url)) {
  throw new Error(
    `VIDEO.json "url" must be a valid YouTube Shorts URL (https://www.youtube.com/shorts/<11-character id>), got: ${url}`,
  );
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(videoPath, join(outputDir, "VIDEO.json"));
console.log(`Copied VIDEO.json to ${join(outputDir, "VIDEO.json")} (url: ${url})`);
