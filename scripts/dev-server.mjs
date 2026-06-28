import { createReadStream, statSync } from "node:fs";
import { access, readFile, stat, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PORT = Number(process.env.PORT || 5173);
const WORKSPACE_CARD_PNG = join(ROOT, "public/cards/hypnosis-app.png");
const WORKSPACE_CARD_JSON = join(ROOT, "public/cards/hypnosis-app-workbench-current.json");
const MAX_POST_BYTES = 32 * 1024 * 1024;
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

const MIME = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
};

function sendHeaders(response, status, filePath = "") {
  response.statusCode = status;
  for (const [key, value] of Object.entries({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Range",
    "Cache-Control": "no-store",
    "Content-Type": MIME[extname(filePath).toLowerCase()] || "application/octet-stream",
  })) {
    response.setHeader(key, value);
  }
}

function sendJson(response, status, value) {
  response.statusCode = status;
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "GET,HEAD,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type,Range");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.end(JSON.stringify(value));
}

function readRequestBody(request) {
  return new Promise((resolveBody, rejectBody) => {
    const chunks = [];
    let size = 0;
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > MAX_POST_BYTES) {
        rejectBody(new Error("Request body too large"));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolveBody(Buffer.concat(chunks)));
    request.on("error", rejectBody);
  });
}

async function handleWorkbenchPost(request, response, pathname) {
  if (pathname === "/__workbench/save-card-png") {
    const body = await readRequestBody(request);
    if (body.length < PNG_SIGNATURE.length || !body.subarray(0, PNG_SIGNATURE.length).equals(PNG_SIGNATURE)) {
      sendJson(response, 400, { ok: false, error: "Invalid PNG" });
      return true;
    }
    const current = await readFile(WORKSPACE_CARD_PNG).catch(() => null);
    const unchanged = current && current.equals(body);
    if (!unchanged) await writeFile(WORKSPACE_CARD_PNG, body);
    sendJson(response, 200, { ok: true, unchanged, path: "public/cards/hypnosis-app.png", size: body.length });
    return true;
  }

  if (pathname === "/__workbench/save-card-json") {
    const body = await readRequestBody(request);
    const parsed = JSON.parse(body.toString("utf8"));
    const next = `${JSON.stringify(parsed, null, 2)}\n`;
    const current = await readFile(WORKSPACE_CARD_JSON, "utf8").catch(() => null);
    const unchanged = current === next;
    if (!unchanged) await writeFile(WORKSPACE_CARD_JSON, next, "utf8");
    sendJson(response, 200, { ok: true, unchanged, path: "public/cards/hypnosis-app-workbench-current.json" });
    return true;
  }

  return false;
}

function resolveRequestPath(url) {
  const pathname = decodeURIComponent(new URL(url, `http://127.0.0.1:${PORT}`).pathname);
  const safePath = normalize(pathname).replace(/^(\.\.[/\\])+/, "");
  const filePath = resolve(join(ROOT, safePath));
  if (filePath !== ROOT && !filePath.startsWith(ROOT + sep)) return null;
  return filePath;
}

async function existingFile(filePath) {
  if (!filePath) return null;
  try {
    const current = await stat(filePath);
    if (current.isDirectory()) return join(filePath, "index.html");
    return filePath;
  } catch {
    return null;
  }
}

const server = createServer(async (request, response) => {
  const pathname = decodeURIComponent(new URL(request.url || "/", `http://127.0.0.1:${PORT}`).pathname);

  if (request.method === "OPTIONS") {
    sendHeaders(response, 204);
    response.end();
    return;
  }

  if (request.method === "POST") {
    try {
      if (await handleWorkbenchPost(request, response, pathname)) return;
      sendJson(response, 404, { ok: false, error: "Not found" });
    } catch (error) {
      sendJson(response, 500, { ok: false, error: error.message });
    }
    return;
  }

  if (!["GET", "HEAD"].includes(request.method || "")) {
    sendHeaders(response, 405);
    response.end("Method not allowed");
    return;
  }

  const filePath = await existingFile(resolveRequestPath(request.url || "/"));
  try {
    if (!filePath) throw new Error("Not found");
    await access(filePath);
    const info = statSync(filePath);
    sendHeaders(response, 200, filePath);
    response.setHeader("Content-Length", info.size);
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    createReadStream(filePath).pipe(response);
  } catch {
    sendHeaders(response, 404, ".txt");
    response.end("Not found");
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`CORS dev server running at http://127.0.0.1:${PORT}/`);
});
