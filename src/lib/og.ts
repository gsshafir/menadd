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
    .resize(630, 630, { fit: "cover", position: "top" })
    .sharpen({ sigma: 0.8, m1: 0.7, m2: 1.5, x1: 2, y2: 10, y3: 20 })
    .png()
    .toBuffer();
  const overlay = encode(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <text x="34" y="210" fill="${accent}" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3">MENADD</text>
      <text x="34" y="278" fill="${text}" font-family="Georgia, serif" font-size="45" font-weight="600">
        <tspan x="34">Gennady</tspan>
        <tspan x="34" dy="52">Shafir</tspan>
      </text>
      <text x="947" y="174" fill="${muted}" font-family="Arial, sans-serif" font-size="22">
        <tspan x="947">CFO and board</tspan>
        <tspan x="947" dy="30">advisor</tspan>
      </text>
      <text x="947" y="282" fill="${text}" font-family="Georgia, serif" font-size="31" font-weight="600">
        <tspan x="947">I read the</tspan>
        <tspan x="947" dy="40">cap table</tspan>
        <tspan x="947" dy="40">before I read</tspan>
        <tspan x="947" dy="40">the plan.</tspan>
      </text>
    </svg>`);

  return sharp({ create: { width: 1200, height: 630, channels: 3, background } })
    .composite([
      { input: portrait, left: 285, top: 0 },
      { input: overlay, left: 0, top: 0 }
    ])
    .jpeg({ quality: 90, chromaSubsampling: "4:4:4" })
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
