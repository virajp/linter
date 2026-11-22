import { execFileSync } from "node:child_process";
import {
  dirname,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import {
  describe,
  expect,
  test,
} from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "../..");

// The known peer mismatches, as "<parent>><peer>@<wanted range>", each with
// its reason. The test fails on a mismatch that is not in this list, and also
// on an entry that no longer matches, so that a fixed mismatch leaves the list.
const ALLOWED = {} as const;

interface PeerIssue {
  parents: Array<{ name: string }>;
  wantedRange: string;
  optional: boolean;
}

interface PeersReport {
  bad: Record<string, PeerIssue[]>;
  missing: Record<string, PeerIssue[]>;
  conflicts: unknown[];
}

function peersCheck(): Record<string, PeersReport> {
  // pnpm peers check exits 1 when it finds an issue. The JSON is the result.
  try {
    return JSON.parse(
      execFileSync("pnpm", ["peers", "check", "--json"], {
        cwd: ROOT,
        encoding: "utf8",
      }),
    ) as Record<string, PeersReport>;
  }
  catch (e) {
    const stdout = (e as { stdout?: string }).stdout ?? "";
    return JSON.parse(stdout) as Record<string, PeersReport>;
  }
}

describe("peer dependencies", () => {
  test("every peer range is satisfied, except the allowed ones", () => {
    const issues: string[] = [];
    let conflicts = 0;
    for (const report of Object.values(peersCheck())) {
      conflicts += report.conflicts.length;
      for (const group of [report.bad, report.missing]) {
        for (const [peer, list] of Object.entries(group)) {
          for (const issue of list.filter(i => !i.optional)) {
            for (const parent of issue.parents) {
              issues.push(`${parent.name}>${peer}@${issue.wantedRange}`);
            }
          }
        }
      }
    }
    expect(conflicts).toBe(0);
    expect([...new Set(issues)].sort()).toEqual(Object.keys(ALLOWED).sort());
  }, 60_000);
});
