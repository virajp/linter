import {
  cpSync,
  existsSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  join,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, "../fixtures");

export function createTempDir(prefix = "linter-test-"): string {
  return mkdtempSync(join(tmpdir(), prefix));
}

export function copyFixture(fixturePath: string, destDir: string): string {
  const src = join(FIXTURES_DIR, fixturePath);
  if (!existsSync(src)) {
    throw new Error(`Fixture not found: ${src}`);
  }
  const dest = join(destDir, basename(fixturePath));
  cpSync(src, dest, { recursive: true });
  return dest;
}

export function cleanupTempDir(dir: string): void {
  if (existsSync(dir)) {
    rmSync(dir, { recursive: true, force: true });
  }
}
