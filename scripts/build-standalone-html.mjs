import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outJs = resolve(root, ".standalone/astro-bundle.js");
mkdirSync(resolve(root, ".standalone"), { recursive: true });

const result = spawnSync(
  "npx",
  [
    "--yes",
    "esbuild",
    "src/standalone/entry.tsx",
    "--bundle",
    "--format=iife",
    "--platform=browser",
    "--target=es2020",
    "--jsx=automatic",
    "--outfile=" + outJs,
    "--alias:@=" + resolve(root, "src"),
    "--legal-comments=none",
  ],
  { cwd: root, stdio: "inherit", shell: process.platform === "win32" },
);

if (result.status !== 0) process.exit(result.status ?? 1);

const js = readFileSync(outJs, "utf8");
const css = readFileSync(resolve(root, "src/app/globals.css"), "utf8").replace('@import "tailwindcss";', "");
const icon = existsSync(resolve(root, "public/apple-touch-icon.png")) ? "/apple-touch-icon.png" : "";

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <meta name="apple-mobile-web-app-title" content="Astro" />
  <meta name="theme-color" content="#07080c" />
  ${icon ? `<link rel="apple-touch-icon" href="${icon}" />` : ""}
  <link rel="manifest" href="/manifest.webmanifest" />
  <title>Astro Election & Horary Research Engine</title>
  <style>
${css}
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
${js}
  </script>
</body>
</html>
`;

writeFileSync(resolve(root, "public/iphone.html"), html);
writeFileSync(resolve(root, "public/astro-full.html"), html);
console.log("Wrote public/iphone.html and public/astro-full.html", Buffer.byteLength(html), "bytes");
