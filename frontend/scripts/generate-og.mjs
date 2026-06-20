// Generates public/og-default.png (1200x630), the default social-share image.
// Run with:  node scripts/generate-og.mjs
// Uses the Sand & Ocean brand tokens. Re-run if the brand copy/colours change.
import sharp from "sharp";
import { writeFileSync } from "node:fs";

const W = 1200;
const H = 630;

// Sand & Ocean light-theme tokens (from styles/globals.css)
const sand = "#f6f1e9";
const paper = "#fbf8f2";
const ink = "#1e2a36";
const ink2 = "#49555f";
const ocean = "#1d6475";
const sea = "#208073";
const line = "#ded6c6";

const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${sand}"/>
  <rect x="44" y="44" width="${W - 88}" height="${H - 88}" rx="30" fill="${paper}" stroke="${line}" stroke-width="2"/>
  <text x="96" y="138" font-family="Georgia, 'Times New Roman', serif" font-size="36" font-weight="700" fill="${ocean}">MigRent</text>
  <text x="96" y="214" font-family="Helvetica, Arial, sans-serif" font-size="22" letter-spacing="3" fill="${sea}">VERIFIED RENTALS &#183; AUSTRALIA</text>
  <text x="92" y="306" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="700" fill="${ink}">A real home in Australia,</text>
  <text x="92" y="386" font-family="Georgia, 'Times New Roman', serif" font-size="70" font-weight="700" fill="${ocean}">found the right way.</text>
  <text x="96" y="452" font-family="Helvetica, Arial, sans-serif" font-size="30" fill="${ink2}">Verified rooms for migrants, students &amp; new arrivals.</text>
  <g font-family="Helvetica, Arial, sans-serif" font-size="24" fill="${ink2}">
    <circle cx="104" cy="534" r="7" fill="${sea}"/>
    <text x="122" y="542">ID-verified hosts</text>
    <circle cx="392" cy="534" r="7" fill="${sea}"/>
    <text x="410" y="542">Bond in escrow</text>
    <circle cx="650" cy="534" r="7" fill="${sea}"/>
    <text x="668" y="542">$0 renter fees</text>
  </g>
</svg>`;

const png = await sharp(Buffer.from(svg)).png().toBuffer();
writeFileSync(new URL("../public/og-default.png", import.meta.url), png);
console.log(`Wrote public/og-default.png (${png.length} bytes)`);
