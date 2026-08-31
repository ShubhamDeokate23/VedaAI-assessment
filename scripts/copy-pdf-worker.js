const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "pdfjs-dist", "build", "pdf.worker.min.mjs");
const dest = path.join(__dirname, "..", "public", "pdf.worker.min.mjs");

try {
  fs.copyFileSync(src, dest);
  console.log("Copied pdf.worker.min.mjs to /public");
} catch (e) {
  console.warn("Could not copy pdf worker (this is fine if pdfjs-dist isn't installed yet):", e.message);
}
