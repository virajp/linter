import {
  realpathSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "vitest";
import { runCliJson } from "../../../helpers/run-cli.js";
import {
  cleanupTempDir,
  createTempDir,
} from "../../../helpers/temp-dir.js";

// The regression test of the client-script TypeScript fix: the built CLI,
// run from a directory outside this repo (where @typescript-eslint/parser does
// not resolve from the cwd), parses TypeScript in the frontmatter and in a
// client <script> of an .astro file.
const SOURCE = `---
const n = 1 as number;
---
<h1>{n}</h1>
<script>
  const heading = document.querySelector("h1") as HTMLElement;
  const label: string = heading.textContent ?? "";
  heading.title = label;
</script>
`;

describe("TypeScript in the client script of an .astro file", () => {
  let dir: string;

  beforeAll(() => {
    // The real path, because ESLint reports /private/var/... on macOS.
    dir = realpathSync(createTempDir());
    writeFileSync(join(dir, "page.astro"), SOURCE);
  });

  afterAll(() => {
    cleanupTempDir(dir);
  });

  test("parses with no fatal error", async () => {
    const results = await runCliJson(["page.astro"], dir);
    expect(results).toHaveLength(1);
    const messages = results[0]!["messages"] as Array<
      { fatal?: boolean; message: string }
    >;
    expect(messages.filter(m => m.fatal)).toEqual([]);
    expect(messages).toEqual([]);
  });
});
