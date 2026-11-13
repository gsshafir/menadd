import sharp from "sharp";

const background = "#fbfaf7";
const text = "#171717";
const muted = "#5f5b53";
const accent = "#1e3a5f";
const encode = (value: string) => new TextEncoder().encode(value);

const escapeXml = (value: string) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

const wrap = (value: string, limit: number) => {
  const words = value.split(/\s+/);
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length > limit && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
};

export async function createSharedOg() {
  const runtime = globalThis as typeof globalThis & { process: { cwd: () => string } };
  const portraitPath = `${runtime.process.cwd().replaceAll("\\", "/")}/src/assets/gennady-shafir.jpg`;
  const portrait = await sharp(portraitPath)
    .resize(520, 630, { fit: "cover", position: "attention" })
    .png()
    .toBuffer();
  const overlay = encode(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect x="520" width="680" height="630" fill="${background}"/>
      <text x="590" y="92" fill="${accent}" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="3">MENADD</text>
      <text x="590" y="230" fill="${text}" font-family="Georgia, serif" font-size="64" font-weight="600">Gennady Shafir</text>
      <text x="590" y="278" fill="${muted}" font-family="Arial, sans-serif" font-size="28">CFO and board advisor</text>
      <line x1="590" y1="335" x2="1110" y2="335" stroke="#e4e1da" stroke-width="2"/>
      <text x="590" y="405" fill="${text}" font-family="Georgia, serif" font-size="38">
        <tspan x="590">I read the cap table before</tspan>
        <tspan x="590" dy="52">I read the plan.</tspan>
      </text>
    </svg>`);

  return sharp({ create: { width: 1200, height: 630, channels: 3, background } })
    .composite([
      { input: portrait, left: 0, top: 0 },
      { input: overlay, left: 0, top: 0 }
    ])
    .jpeg({ quality: 78, chromaSubsampling: "4:2:0", mozjpeg: true })
    .toBuffer();
}

export async function createArticleOg(section: string, titleValue: string) {
  const lines = wrap(titleValue, 34);
  const titleLines = lines.map((line, index) => `<tspan x="78" dy="${index === 0 ? 0 : 76}">${escapeXml(line)}</tspan>`).join("");
  const svg = encode(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="${background}"/>
      <rect x="0" y="0" width="18" height="630" fill="${accent}"/>
      <text x="78" y="94" fill="${accent}" font-family="Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="2">${escapeXml(section.toUpperCase())}</text>
      <text x="78" y="208" fill="${text}" font-family="Georgia, serif" font-size="62" font-weight="600">${titleLines}</text>
      <line x1="78" y1="528" x2="1122" y2="528" stroke="#e4e1da" stroke-width="2"/>
      <text x="78" y="579" fill="${muted}" font-family="Arial, sans-serif" font-size="25">Gennady Shafir · MENADD</text>
    </svg>`);

  return sharp(svg).jpeg({ quality: 78, chromaSubsampling: "4:2:0", mozjpeg: true }).toBuffer();
}
