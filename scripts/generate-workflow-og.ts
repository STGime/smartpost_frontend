import sharp from "sharp";

const OUT = "/Users/stefangimeson/smartpost_frontend/public/assets/workflows/og";
const LOGO = "/Users/stefangimeson/smartpost_frontend/public/assets/posta_logo_512.png";
const FONT = "'Liberation Sans','DejaVu Sans','Helvetica Neue',Arial,sans-serif";
const W = 1200, H = 630;

type WF = { slug: string; title: string; chain: string[]; accent: string; accent2: string };
const WORKFLOWS: WF[] = [
  { slug: "blog-to-social-media", title: "Share new blog posts to social media automatically",
    chain: ["RSS Read","Get accounts","Upload media","Create post","Schedule"], accent: "#2563eb", accent2: "#0ea5e9" },
  { slug: "blog-to-linkedin-carousel", title: "Turn a blog post into a LinkedIn carousel",
    chain: ["RSS Read","DeepSeek","fal.ai","Carousel PDF","LinkedIn post"], accent: "#7c3aed", accent2: "#a855f7" },
  { slug: "product-launch-campaign", title: "Run a 5-day product launch campaign",
    chain: ["Fetch product","DeepSeek captions","Dedupe platforms","Schedule 5 days"], accent: "#db2777", accent2: "#f97316" },
  { slug: "youtube-to-social-media", title: "Promote your latest YouTube video everywhere",
    chain: ["YouTube feed","Latest video","Upload thumb","DeepSeek","Draft posts"], accent: "#e11d48", accent2: "#f59e0b" },
];

const esc = (s: string) => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

function wrap(text: string, fontSize: number, maxWidth: number, factor = 0.54): string[] {
  const maxChars = Math.max(1, Math.floor(maxWidth / (fontSize * factor)));
  const words = text.split(/\s+/);
  const lines: string[] = []; let line = "";
  for (const w of words) {
    const t = line ? `${line} ${w}` : w;
    if (t.length > maxChars && line) { lines.push(line); line = w; } else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

// node-chain pills, wrapping rows
function pills(chain: string[], x0: number, y0: number, accent: string): string {
  const fs = 22, ph = 42, padX = 18, gap = 12, charW = fs * 0.55, maxX = W - 64;
  let x = x0, y = y0, out = "";
  chain.forEach((n, i) => {
    const w = Math.round(n.length * charW + padX * 2);
    if (x + w > maxX) { x = x0; y += ph + 14; }
    out += `<rect x="${x}" y="${y}" width="${w}" height="${ph}" rx="${ph/2}" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>`;
    out += `<text x="${x + w/2}" y="${y + ph/2 + 7}" text-anchor="middle" font-family="${FONT}" font-size="${fs}" fill="#e5e7eb">${esc(n)}</text>`;
    x += w;
    if (i < chain.length - 1) {
      out += `<text x="${x + gap/2}" y="${y + ph/2 + 8}" text-anchor="middle" font-family="${FONT}" font-size="20" fill="${accent}">›</text>`;
      x += gap + 14;
    }
  });
  return out;
}

for (const wf of WORKFLOWS) {
  const titleLines = wrap(wf.title, 58, W - 128);
  const titleY = 250 - (titleLines.length - 1) * 34;
  const titleSvg = titleLines.map((ln, i) =>
    `<text x="64" y="${titleY + i * 70}" font-family="${FONT}" font-weight="700" font-size="58" fill="#ffffff">${esc(ln)}</text>`).join("");

  const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#0b1020"/><stop offset="100%" stop-color="#0a0a18"/>
      </linearGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="120"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#bg)"/>
    <g filter="url(#blur)">
      <ellipse cx="980" cy="120" rx="360" ry="300" fill="${wf.accent}" opacity="0.55"/>
      <ellipse cx="1140" cy="540" rx="320" ry="280" fill="${wf.accent2}" opacity="0.40"/>
      <ellipse cx="120" cy="600" rx="300" ry="240" fill="${wf.accent}" opacity="0.25"/>
    </g>
    <rect width="${W}" height="${H}" fill="#020617" opacity="0.30"/>
    <!-- brand row -->
    <text x="148" y="78" font-family="${FONT}" font-weight="700" font-size="30" fill="#ffffff">Posta</text>
    <rect x="148" y="92" width="186" height="30" rx="15" fill="rgba(255,255,255,0.10)" stroke="rgba(255,255,255,0.18)"/>
    <text x="241" y="112" text-anchor="middle" font-family="${FONT}" font-size="17" fill="#cbd5e1">n8n workflow template</text>
    ${titleSvg}
    ${pills(wf.chain, 64, 470, wf.accent2)}
    <text x="64" y="600" font-family="${FONT}" font-size="22" fill="rgba(255,255,255,0.6)">getposta.app/workflows</text>
  </svg>`;

  const base = await sharp(Buffer.from(svg)).png().toBuffer();
  const logo = await sharp(LOGO).resize(72, 72).toBuffer();
  await sharp(base)
    .composite([{ input: logo, top: 44, left: 64 }])
    .jpeg({ quality: 90 })
    .toFile(`${OUT}/${wf.slug}.jpg`);
  console.log("wrote", `${wf.slug}.jpg`);
}
console.log("done");
