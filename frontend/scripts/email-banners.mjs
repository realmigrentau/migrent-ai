// Banner pictures for Migrent's emails: one per kind of email.
// Run: node scripts/email-banners.mjs   (writes public/email/banner-<kind>.png)
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const out = path.join(root, "public/email");
fs.mkdirSync(out, { recursive: true });

// Kept in step with backend/email_theme.py THEMES.
const THEMES = {
  account: { from: "#3153D9", to: "#7C5CFF", icon: "house-plus" },
  applications: { from: "#2453D6", to: "#0891B2", icon: "file-check" },
  inspections: { from: "#C2410C", to: "#F59E0B", icon: "calendar-check" },
  messages: { from: "#4338CA", to: "#DB2777", icon: "messages-square" },
  money: { from: "#047857", to: "#10B981", icon: "receipt-text" },
  listings: { from: "#6D28D9", to: "#3153D9", icon: "house" },
  searches: { from: "#0369A1", to: "#16A34A", icon: "search" },
  home: { from: "#0F766E", to: "#2563EB", icon: "wrench" },
  reviews: { from: "#BE185D", to: "#F59E0B", icon: "star" },
  security: { from: "#B91C1C", to: "#F97316", icon: "shield-alert" },
  support: { from: "#3153D9", to: "#0EA5E9", icon: "life-buoy" },
  stays: { from: "#C2410C", to: "#DB2777", icon: "bed-double" },
  identity: { from: "#0F766E", to: "#16A34A", icon: "badge-check" },
  mentors: { from: "#7C3AED", to: "#DB2777", icon: "hand-heart" },
};

function iconNode(name) {
  const file = path.join(root, "node_modules/lucide-react/dist/esm/icons", `${name}.js`);
  const src = fs.readFileSync(file, "utf8");
  const arr = src.match(/const __iconNode = (\[[\s\S]*?\]);/)[1];
  return Function(`return ${arr}`)();
}

const svgIcon = (name, stroke) =>
  iconNode(name)
    .map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).filter(([k]) => k !== "key").map(([k, v]) => `${k}="${v}"`).join(" ")}/>`)
    .join("")
    .replace(/^/, `<g fill="none" stroke="${stroke}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">`) + "</g>";

// A row of little rooftops along the bottom: Migrent's homes motif.
function skyline(w, h) {
  let x = -10, d = "";
  const seed = [46, 62, 38, 70, 52, 44, 66, 40, 58, 74, 48, 60, 42, 68, 50, 56];
  let i = 0;
  while (x < w) {
    const bw = 54 + (i % 3) * 14, bh = seed[i % seed.length];
    const top = h - bh;
    d += `M${x} ${h} V${top} L${x + bw / 2} ${top - bw * 0.42} L${x + bw} ${top} V${h} Z `;
    x += bw + 10;
    i++;
  }
  return `<path d="${d}" fill="#ffffff" fill-opacity="0.10"/>`;
}

function banner(kind, t) {
  const W = 1200, H = 360;
  const dots = Array.from({ length: 6 }, (_, r) => Array.from({ length: 10 }, (_, c) => `<circle cx="${70 + c * 34}" cy="${60 + r * 34}" r="3" fill="#fff" fill-opacity="0.13"/>`).join("")).join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${t.from}"/><stop offset="1" stop-color="${t.to}"/></linearGradient></defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  ${dots}
  <circle cx="1080" cy="-40" r="230" fill="#fff" fill-opacity="0.08"/>
  <circle cx="1150" cy="330" r="160" fill="#fff" fill-opacity="0.07"/>
  <circle cx="560" cy="420" r="200" fill="#fff" fill-opacity="0.05"/>
  ${skyline(W, H)}
  <circle cx="900" cy="170" r="118" fill="#ffffff"/>
  <circle cx="900" cy="170" r="138" fill="none" stroke="#fff" stroke-opacity="0.35" stroke-width="3"/>
  <g transform="translate(828 98) scale(6)">${svgIcon(t.icon, t.from)}</g>
</svg>`;
}

for (const [kind, t] of Object.entries(THEMES)) {
  await sharp(Buffer.from(banner(kind, t))).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(path.join(out, `banner-${kind}.png`));
}
// The logo for the email header.
const logo = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 110 110" width="220" height="220"><rect width="110" height="110" rx="24" fill="#3153D9"/><g transform="translate(55 57)"><path d="M-30 -2 L0 -30 L30 -2 V30 H-30 Z" fill="#fff" stroke="#fff" stroke-width="4" stroke-linejoin="round"/><g fill="none" stroke="#3153D9" stroke-width="4" stroke-linecap="round"><circle cx="-12" cy="12" r="7"/><line x1="-5" y1="12" x2="20" y2="12"/><line x1="12" y1="12" x2="12" y2="19"/><line x1="19" y1="12" x2="19" y2="17"/></g></g></svg>`;
await sharp(Buffer.from(logo)).png().toFile(path.join(out, "logo.png"));
console.log("banners:", Object.keys(THEMES).length);
