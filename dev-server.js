// Local development server: serves the static site and routes /api/chat to the
// same handler Vercel runs in production. Usage: npm run dev
import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import handler from "./api/chat.js";

const PORT = process.env.PORT || 3000;
const TYPES = { ".html": "text/html", ".css": "text/css", ".js": "text/javascript", ".mp4": "video/mp4", ".png": "image/png", ".jpg": "image/jpeg" };
const PUBLIC_DIR = path.resolve("public");

http
  .createServer(async (req, res) => {
    if (req.url === "/api/chat") {
      let raw = "";
      for await (const chunk of req) raw += chunk;
      req.body = raw;
      return handler(req, res);
    }

    const urlPath = req.url.split("?")[0];
    const file = path.join(PUBLIC_DIR, urlPath === "/" ? "index.html" : urlPath);
    if (!file.startsWith(PUBLIC_DIR)) return res.writeHead(403).end();
    try {
      const data = await readFile(file);
      res.writeHead(200, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404).end("Not found");
    }
  })
  .listen(PORT, () => console.log(`Belley running at http://localhost:${PORT}`));
