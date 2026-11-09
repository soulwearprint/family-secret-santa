// Rasterise app/static/favicon.svg (Santa head on a pine-green tile) into the PNG/ICO icons.
// Usage: node tools/render_favicon.js   (needs Playwright + Chromium)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const dir = path.resolve(__dirname, "..", "app", "static");
const svg = fs.readFileSync(path.join(dir, "favicon.svg"), "utf8");

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const png = async (size, square = false) => {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<html><body style="margin:0;background:transparent">${(square ? svg.replace('rx="22"', 'rx="0"') : svg).replace("<svg ", `<svg width="${size}" height="${size}" `)}</body></html>`);
    return page.locator("svg").screenshot({ omitBackground: true });
  };
  fs.writeFileSync(path.join(dir, "favicon-32.png"), await png(32));
  // iOS rounds the corners itself and turns transparent ones black, so this one is a full square
  fs.writeFileSync(path.join(dir, "apple-touch-icon.png"), await png(180, true));
  // favicon.ico = ICO container holding PNG images (supported by every current browser)
  const imgs = [await png(16), await png(32), await png(48)];
  const head = Buffer.alloc(6 + 16 * imgs.length);
  head.writeUInt16LE(0, 0); head.writeUInt16LE(1, 2); head.writeUInt16LE(imgs.length, 4);
  let off = head.length;
  imgs.forEach((b, i) => {
    const s = [16, 32, 48][i], e = 6 + 16 * i;
    head.writeUInt8(s, e); head.writeUInt8(s, e + 1); head.writeUInt16LE(1, e + 4); head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(b.length, e + 8); head.writeUInt32LE(off, e + 12); off += b.length;
  });
  fs.writeFileSync(path.join(dir, "favicon.ico"), Buffer.concat([head, ...imgs]));
  await browser.close();
})();
