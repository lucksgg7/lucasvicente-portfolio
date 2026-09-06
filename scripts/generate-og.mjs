// Genera public/og-image.png (1200x630) para las meta OG/Twitter.
// Uso desde la raíz del repo:  node scripts/generate-og.mjs
// Requiere sharp (si no está: npm install --no-save sharp)
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const OUT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public", "og-image.png");

const NAME = "Lucas Vicente";
const TITLE = "AI Solutions Builder";
const TECH = "Agentes IA · Voz en tiempo real · React · Next.js · Go · Docker";
const STATUS = "Madrid · Remoto o híbrido";
const BADGE = "7 productos en producción";
const FONT = "Inter, 'Segoe UI', system-ui, -apple-system, sans-serif";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0 L0 0 0 40" fill="none" stroke="#ffffff" stroke-opacity="0.028" stroke-width="1"/>
    </pattern>
    <radialGradient id="glow" cx="18%" cy="30%" r="70%">
      <stop offset="0%" stop-color="#2563EB" stop-opacity="0.16"/>
      <stop offset="100%" stop-color="#2563EB" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <rect width="1200" height="630" fill="#0A0A0B"/>
  <rect width="1200" height="630" fill="url(#grid)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <rect x="80" y="80" width="64" height="64" rx="15" fill="#FFFFFF"/>
  <text x="112" y="123" font-family="${FONT}" font-size="29" font-weight="800"
        fill="#0A0A0B" text-anchor="middle">LV</text>
  <text x="166" y="122" font-family="${FONT}" font-size="26" font-weight="500"
        fill="#E4E4E7">lucasvicente.es</text>

  <rect x="80" y="232" width="64" height="6" rx="3" fill="#2563EB"/>

  <text x="80" y="342" font-family="${FONT}" font-size="92" font-weight="800"
        fill="#FFFFFF" letter-spacing="-2">${NAME}</text>
  <text x="80" y="412" font-family="${FONT}" font-size="46" font-weight="600"
        fill="#A1A1AA" letter-spacing="-0.5">${TITLE}</text>
  <text x="80" y="464" font-family="${FONT}" font-size="27" font-weight="400"
        fill="#71717A">${TECH}</text>

  <circle cx="90" cy="549" r="7" fill="#22C55E"/>
  <text x="112" y="557" font-family="${FONT}" font-size="25" font-weight="500"
        fill="#D4D4D8">${STATUS}</text>
  <text x="1120" y="557" font-family="${FONT}" font-size="25" font-weight="400"
        fill="#71717A" text-anchor="end">${BADGE}</text>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log("OG generada ->", OUT);
