import { serve } from "bun";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const PORT = 3000;
const DIST_DIR = "./dist";

serve({
  port: PORT,
  fetch(request) {
    const url = new URL(request.url);
    let filePath = join(DIST_DIR, url.pathname);

    // If it's a directory or doesn't exist, try to serve index.html
    if (url.pathname === "/" || !existsSync(filePath) || url.pathname.endsWith("/")) {
      filePath = join(DIST_DIR, "index.html");
    }

    try {
      const file = readFileSync(filePath);
      
      // Determine content type
      const ext = filePath.split(".").pop();
      const contentType = {
        html: "text/html",
        js: "application/javascript",
        css: "text/css",
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        svg: "image/svg+xml",
        ico: "image/x-icon",
      }[ext || ""] || "text/plain";

      return new Response(file, {
        headers: { "Content-Type": contentType },
      });
    } catch {
      // Fallback to index.html for client-side routing
      try {
        const indexFile = readFileSync(join(DIST_DIR, "index.html"));
        return new Response(indexFile, {
          headers: { "Content-Type": "text/html" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }
  },
});

console.log(`Server running at http://localhost:${PORT}`);
