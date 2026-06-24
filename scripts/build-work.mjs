import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Regenerates the curated work imagery from source files in /public/work.
 *  - /public/work/hero/<slug>.webp      → hero showcase strip (aspect kept, h800)
 *  - /public/work/portfolio/<slug>.webp → proof carousel cards (4:3 cover crop)
 * Sources: legacy numbered originals in /public/work and Behance pulls in
 * /public/work/sources. Run with `node scripts/build-work.mjs`.
 */
const root = path.resolve(import.meta.dirname, "..");
const workDir = path.join(root, "public/work");
const srcDir = path.join(workDir, "sources");
const heroDir = path.join(workDir, "hero");
const portfolioDir = path.join(workDir, "portfolio");

fs.mkdirSync(heroDir, { recursive: true });
fs.mkdirSync(portfolioDir, { recursive: true });

for (const d of [heroDir, portfolioDir]) {
  for (const f of fs.readdirSync(d)) {
    if (/\.webp$/i.test(f)) fs.unlinkSync(path.join(d, f));
  }
}

// origin: "work" = legacy originals in /public/work, "src" = /public/work/sources
const ITEMS = [
  { slug: "alltrad-swatches", src: ["src", "alltrad-swatches.webp"], title: "Alltrad Roofing", sub: "Brand System" },
  { slug: "alltrad-card", src: ["src", "alltrad-card.webp"], title: "Alltrad Roofing", sub: "Brand Identity" },
  { slug: "alltrad-billboard", src: ["src", "alltrad-billboard.webp"], title: "Alltrad Roofing", sub: "Out-of-Home" },
  { slug: "hampshire-billboard", src: ["src", "hampshire-billboard.webp"], title: "Hampshire Food Hub", sub: "Out-of-Home" },
  { slug: "hampshire-lifestyle", src: ["src", "hampshire-lifestyle.webp"], title: "Hampshire Food Hub", sub: "Brand Campaign" },
  { slug: "eazyphone-billboard", src: ["src", "eazyphone-billboard.webp"], title: "EazyPhone", sub: "Out-of-Home" },
  { slug: "eazyphone-cards", src: ["src", "eazyphone-cards.webp"], title: "EazyPhone", sub: "Brand Identity" },
  { slug: "eazyphone-busstop", src: ["work", "06_EazyPhone_BusStop.png"], title: "EazyPhone", sub: "Out-of-Home" },
  { slug: "eazyphone-lanyards", src: ["work", "08_EazyPhone_Lanyards.png"], title: "EazyPhone", sub: "Brand Collateral" },
  { slug: "flexibuy", src: ["work", "01_FlexiBuy_Get_Moving.png"], title: "FlexiBuy", sub: "Campaign Creative" },
  { slug: "mint-keys", src: ["work", "14_MintMortgages_Keys_Campaign.png"], title: "Mint Mortgages", sub: "Campaign" },
  { slug: "mint-broker", src: ["work", "15_MintMortgages_Local_Broker.png"], title: "Mint Mortgages", sub: "Brand Identity" },
  { slug: "mint-billboard", src: ["src", "mint-billboard.webp"], title: "Mint Mortgages", sub: "Out-of-Home" },
  { slug: "powerforce-card", src: ["work", "17_PFR_Business_Card.jpg"], title: "Powerforce", sub: "Print" },
  { slug: "powerforce-turbine", src: ["src", "powerforce-turbine.jpg"], title: "Powerforce", sub: "Brand Campaign" },
  { slug: "salesprout-billboard", src: ["src", "salesprout-billboard.webp"], title: "SaleSprout", sub: "Campaign" },
  { slug: "ejw-builttolast", src: ["src", "ejw-builttolast.webp"], title: "EJW", sub: "Brand Campaign" },
  { slug: "mailmans", src: ["work", "11_Mailmans_Lightbox_Sign.png"], title: "Mailmans", sub: "Signage" },
  { slug: "melt-pizza", src: ["work", "45_MeltPizza_Poster_Boxes.png"], title: "Melt Pizza", sub: "Packaging" },
];

const resolve = ([origin, file]) =>
  origin === "work" ? path.join(workDir, file) : path.join(srcDir, file);

const fmt = (b) =>
  b < 1024 ? `${b} B` : b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

for (const item of ITEMS) {
  const src = resolve(item.src);
  if (!fs.existsSync(src)) {
    console.warn(`MISSING: ${src}`);
    continue;
  }
  const heroOut = path.join(heroDir, `${item.slug}.webp`);
  await sharp(src).rotate().resize({ height: 800, withoutEnlargement: true }).webp({ quality: 82, effort: 5 }).toFile(heroOut);

  const portOut = path.join(portfolioDir, `${item.slug}.webp`);
  await sharp(src).rotate().resize(1200, 900, { fit: "cover", position: sharp.strategy.attention }).webp({ quality: 80, effort: 5 }).toFile(portOut);

  console.log(`${item.slug}: hero ${fmt(fs.statSync(heroOut).size)} | portfolio ${fmt(fs.statSync(portOut).size)}`);
}

console.log(`\nDone — ${ITEMS.length} items.`);
