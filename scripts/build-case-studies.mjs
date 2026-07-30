import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

/**
 * Builds the case-study imagery for /work and /work/[slug] from the source
 * folders in ~/Downloads/case studies. Each image is resized to a max
 * 2200px long edge and encoded as WebP — next/image serves responsive
 * variants from these masters, so grids stay light and full-bleed heroes
 * stay sharp on retina.
 *
 * Run with `node scripts/build-case-studies.mjs`.
 */
const root = path.resolve(import.meta.dirname, "..");
const srcRoot = path.join(process.env.HOME, "Downloads/case studies");
const outRoot = path.join(root, "public/work/case-studies");

// slug → { dir: source folder, images: { source filename → output name } }
const STUDIES = {
  "alltrad-roofing": {
    dir: "Alltrad",
    images: {
      "CHALK.png": "fleece",
      "Frame 53.png": "pin-badge",
      "Frame 54.png": "hard-hat",
      "Frame 55.png": "site-team",
      "Frame 56.png": "website-tablet",
      "Frame-1.png": "flags",
      "Frame-2.png": "logo-banner",
      "Frame-3.png": "card-hand",
      "Frame-4.png": "billboard",
      "Frame.png": "cards-hook",
      "LOGO LOCKUP.png": "site-banner",
      "WEBSITE-1.png": "social-screens",
      "WEBSITE.png": "bus-stop",
    },
  },
  ao: {
    dir: "AO",
    images: {
      "AO-1.png": "laptop",
      "AO-2.png": "phone",
      "AO-3-1.png": "website-booking",
      "AO-3-2.png": "website-pages",
      "AO-3.png": "website-screens",
      "design portfolio-20 1.png": "wordmark",
      "design portfolio-21 1.png": "sign",
      "design portfolio-22 1.png": "instagram",
      "design portfolio-23 1.png": "menu",
    },
  },
  eazyphone: {
    dir: "EazyPhone",
    images: {
      "Artboard 1 copy.png": "billboard",
      "Artboard 1.png": "wordmark",
      "Artboard 2.png": "social",
      "Artboard 3.png": "bus-stop",
      "Artboard 4.png": "cards",
      "Artboard 5.png": "palette",
      "Artboard 6.png": "lanyards",
      "Artboard 7.png": "letterhead",
      "Artboard 8.png": "screen",
      "Artboard 9.png": "posters",
    },
  },
  "ejw-concrete": {
    dir: "EJW Concrete",
    images: {
      "Mockup 1.png": "built-to-last",
      "Mockup 3.png": "site-banner",
      "Mockup 5.png": "website-laptop",
      "Mockup 6.png": "logo-dark",
      "Mockup 7.png": "flags",
      "Mockup 8.png": "id-badge",
    },
  },
  latimers: {
    dir: "Latimers",
    images: {
      "Frame 41.png": "apron",
      "Frame 42.png": "box",
      "Frame 43.png": "wordmark",
      "Frame 44.png": "illustrations",
      "Frame 45.png": "menus",
      "Frame 46.png": "table",
      "Frame 47.png": "bag",
      "Frame 48.png": "social",
      "Frame 49.png": "exterior",
      "Frame 50.png": "glass",
      "latimers-prawn-pasta 1.png": "prawn-pasta",
      "latimers-sea-bass-mussels 1.png": "sea-bass",
      "latimers-squash-tasting-plate 1.png": "tasting-plate",
      "roast-story-size 1.png": "sunday-roast",
    },
  },
  melt: {
    dir: "Melt",
    images: {
      "Frame 60.png": "food-truck",
      "Frame 61.png": "boxes-red",
      "STATIONERY, BEAUTY SHOT-1.png": "menu-cards",
      "STATIONERY, BEAUTY SHOT-10.png": "customers",
      "STATIONERY, BEAUTY SHOT-2.png": "octagon-boxes",
      "STATIONERY, BEAUTY SHOT-3.png": "menu-hand",
      "STATIONERY, BEAUTY SHOT-4.png": "illustrations",
      "STATIONERY, BEAUTY SHOT-5.png": "cap",
      "STATIONERY, BEAUTY SHOT-6.png": "boxes-hands",
      "STATIONERY, BEAUTY SHOT-7.png": "box-handoff",
      "STATIONERY, BEAUTY SHOT-8.png": "open-box",
      "STATIONERY, BEAUTY SHOT.png": "a-frame",
      "hf_20260727_140741_c0af20c3-963c-4be6-9111-c47068a67fd2 1.png": "oven",
    },
  },
  "mint-mortgages": {
    dir: "Mint Mortgages",
    images: {
      "Behance - MM 2.png": "doorstep",
      "Behance - MM 4.png": "billboard",
      "Behance - MM-1 2.png": "palette",
      "Behance - MM-1 4.png": "illustration-rates",
      "Behance - MM-1.png": "social-stats",
      "Behance - MM-2 2.png": "website-screens",
      "Behance - MM-2 4.png": "stationery",
      "Behance - MM-2.png": "illustration-broker",
      "Behance - MM.png": "wordmark",
    },
  },
  "orange-rooms": {
    dir: "Orange Rooms",
    images: {
      "Frame 57.png": "cocktails",
      "Frame 58.png": "drinks",
      "Frame 59.png": "coaster",
      "MARK CONSTRUCTION-1.png": "christmas-menu",
      "MARK CONSTRUCTION.png": "summer-menu",
      "WEBSITE.png": "menu-spreads",
    },
  },
  powerforce: {
    dir: "Powerforce",
    images: {
      "First-section.jpg": "cards",
      "Third-section.jpg": "logo",
      "Fourth-section.jpg": "brand-card",
      "Fifth-section.jpg": "palette",
      "Seventh-section.jpg": "guidelines",
      "Eight-section.jpg": "email",
      "Ninth-section.jpg": "wall-poster",
      "Tenth-section.jpg": "social",
    },
  },
  remigo: {
    dir: "Remigo",
    images: {
      "Billboard_Mockup_1 1.png": "billboard",
      "Dirty_Signboard_Mockup 1.png": "signboard",
      "Laptop Website 1.png": "website-laptop",
      "Phone 1.png": "app-phone",
      "Round_Sign_Mockup 1.png": "round-sign",
      "Metro Banner 1.png": "metro-banner",
      "Large_Fence_Banner_Mockup 1.png": "fence-banner",
      "BenditoMockup-Free-Flying_Banner 1.png": "flag-banner",
    },
  },
  "saints-foundation": {
    dir: "Saints Foundation",
    images: {
      "CharityDinner2024-8.jpg": "main-stage",
      "CharityDinner2024-10.jpg": "programme",
      "CharityDinner2024-11.jpg": "flyers",
      "CharityDinner2024-12.jpg": "banner-stand",
      "CharityDinner2024-14.jpg": "stairs",
      "CharityDinner2024-15.jpg": "media-wall",
      "CharityDinner2024-18.jpg": "welcome-easel",
      "CharityDinner2024-54.jpg": "dinner-room",
    },
  },
  salesprout: {
    dir: "SaleSprout",
    images: {
      "Frame 62.png": "billboard",
      "Frame 63.png": "round-sign",
      "Frame 64.png": "social",
      "Frame 65.png": "app-icon",
      "Frame 66.png": "card",
      "Frame 67.png": "dashboard",
      "Frame 68.png": "guidelines",
    },
  },
};

const MAX_EDGE = 2200;
const fmt = (b) =>
  b < 1048576 ? `${(b / 1024).toFixed(1)} KB` : `${(b / 1048576).toFixed(1)} MB`;

let count = 0;
let totalOut = 0;

for (const [slug, { dir, images }] of Object.entries(STUDIES)) {
  const outDir = path.join(outRoot, slug);
  fs.mkdirSync(outDir, { recursive: true });
  let studyOut = 0;

  for (const [file, name] of Object.entries(images)) {
    const src = path.join(srcRoot, dir, file);
    if (!fs.existsSync(src)) {
      console.error(`MISSING: ${src}`);
      process.exitCode = 1;
      continue;
    }
    const dest = path.join(outDir, `${name}.webp`);
    await sharp(src)
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82, effort: 5, smartSubsample: true })
      .toFile(dest);
    const size = fs.statSync(dest).size;
    studyOut += size;
    count++;
  }

  totalOut += studyOut;
  console.log(`${slug}: ${Object.keys(images).length} images, ${fmt(studyOut)}`);
}

console.log(`\nDone — ${count} images, ${fmt(totalOut)} total.`);
