import { execFile } from "node:child_process";
import { access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  CARD_PATH,
  DIST_REPO_URL,
  DIST_WEBVIEW_DIR,
  VERSION_NAME,
  remoteFrontendUrl,
} from "./card-config.mjs";

const execFileAsync = promisify(execFile);
const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DIST_WORKTREE = process.env.HYPNOOS_DIST_WORKTREE || "/tmp/hypnosisapp5-dist";
const FRONTEND_DIR = "public/frontends/hypnosis-app";
const MAX_BUFFER = 64 * 1024 * 1024;

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function run(command, args, options = {}) {
  console.log(`$ ${[command, ...args].join(" ")}`);
  const { stdout, stderr } = await execFileAsync(command, args, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: MAX_BUFFER,
  });
  if (stdout.trim()) console.log(stdout.trim());
  if (stderr.trim()) console.error(stderr.trim());
}

async function capture(command, args, options = {}) {
  const { stdout } = await execFileAsync(command, args, {
    cwd: options.cwd || ROOT,
    env: { ...process.env, ...(options.env || {}) },
    maxBuffer: MAX_BUFFER,
  });
  return stdout.trim();
}

async function ensureDistWorktree() {
  if (!(await exists(join(DIST_WORKTREE, ".git")))) {
    await run("git", ["clone", DIST_REPO_URL, DIST_WORKTREE], { cwd: "/tmp" });
    return;
  }
  await run("git", ["-C", DIST_WORKTREE, "fetch", "origin", "main"]);
  await run("git", ["-C", DIST_WORKTREE, "switch", "main"]);
  await run("git", ["-C", DIST_WORKTREE, "pull", "--ff-only", "origin", "main"]);
}

async function publishDist() {
  await run(process.execPath, ["scripts/mirror-frontend.mjs"]);
  await ensureDistWorktree();
  await run("/usr/bin/rsync", [
    "-a",
    "--delete",
    "--exclude",
    "source.html",
    `${FRONTEND_DIR}/`,
    `${DIST_WORKTREE}/${DIST_WEBVIEW_DIR}/`,
  ]);

  const status = await capture("git", ["-C", DIST_WORKTREE, "status", "--short", DIST_WEBVIEW_DIR]);
  if (status) {
    await run("git", ["-C", DIST_WORKTREE, "add", DIST_WEBVIEW_DIR]);
    await run("git", ["-C", DIST_WORKTREE, "commit", "-m", `Update ${VERSION_NAME} webview`]);
    await run("git", ["-C", DIST_WORKTREE, "push", "origin", "main"]);
  } else {
    console.log("dist webview unchanged; reusing current commit");
  }

  return capture("git", ["-C", DIST_WORKTREE, "rev-parse", "HEAD"]);
}

const commit = await publishDist();
await run(process.execPath, ["scripts/finalize-card-v1_6.mjs"], {
  env: { HYPNOOS_REMOTE_COMMIT: commit },
});

console.log("");
console.log(`card: ${CARD_PATH}`);
console.log(`commit: ${commit}`);
console.log(`cdn: ${remoteFrontendUrl(commit)}`);
