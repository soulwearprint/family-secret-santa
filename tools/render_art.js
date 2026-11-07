// Rasterise app/static/art/svg/*.svg to app/static/art/png/*.png (2x, transparent).
// Usage: node tools/render_art.js   (needs Playwright + Chromium)
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..", "app", "static", "art");
const src = path.join(root, "svg");
const out = path.join(root, "png");

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2 });
  for (const file of fs.readdirSync(src).filter((f) => f.endsWith(".svg")).sort()) {
    const svg = fs.readFileSync(path.join(src, file), "utf8");
    const [, w, h] = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    await page.setViewportSize({ width: +w, height: +h });
    await page.setContent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`);
    await page.locator("svg").screenshot({ path: path.join(out, file.replace(".svg", ".png")), omitBackground: true });
  }
  await browser.close();
  console.log("rendered", fs.readdirSync(out).length, "PNGs");
})();
