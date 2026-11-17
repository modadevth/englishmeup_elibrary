// Responsive WebP pipeline (quality 75) for the eLibrary site.
// Sources: pro1_Pack_v1.6 + _build/.cache/img (images extracted from mockups). Old site images are removed first.
// Writes img-manifest.json: { "<site-relative path>": [width, height] }
const fs = require('fs'), path = require('path');
const sharp = require('sharp');
const ROOT = path.resolve(__dirname, '..');
const PACK = `${ROOT}/PJ_PART/pro1_Pack_v1.6`;
const EX = path.join(__dirname, '.cache/img');
const Q = 75;
const M = {};
const pages = JSON.parse(fs.readFileSync(`${PACK}/01_หน้าเล่ม/elibrary_pages/pages_v7.json`, 'utf8'));

// ---- clean old images (originals are kept in PJ_PART / ex)
fs.rmSync(`${ROOT}/assets/img`, { recursive: true, force: true });
for (const p of pages) {
  const d = `${ROOT}/${p.sl}`;
  if (!fs.existsSync(d)) continue;
  fs.rmSync(`${d}/example`, { recursive: true, force: true });
  for (const f of fs.readdirSync(d)) if (/\.(jpe?g|png|webp)$/i.test(f)) fs.rmSync(`${d}/${f}`);
}

const jobs = [];
// widths: list of target widths (never upscaled); name(w,h) -> site-relative output path
function variants(src, widths, name, opt = {}) {
  jobs.push(async () => {
    const meta = await sharp(src).metadata();
    const ws = [...new Set(widths.map(w => Math.min(w, meta.width)))];
    for (const w of ws) {
      const h = opt.square ? w : Math.round(meta.height * w / meta.width);
      const rel = name(w, h);
      const out = `${ROOT}/${rel}`;
      fs.mkdirSync(path.dirname(out), { recursive: true });
      const info = await sharp(src).resize(w, opt.square ? w : null).webp({ quality: Q, effort: 6 }).toFile(out);
      M[rel] = [info.width, info.height];
    }
  });
}
function jpeg(src, w, rel) {
  jobs.push(async () => {
    const out = `${ROOT}/${rel}`;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const info = await sharp(src).resize(w, null, { withoutEnlargement: true }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    M[rel] = [info.width, info.height];
  });
}
const exImg = prefix => `${EX}/${fs.readdirSync(EX).find(f => f.startsWith(prefix))}`;

// ---- book pages
for (const p of pages) {
  const src = `${PACK}/01_หน้าเล่ม/elibrary_pages/${p.sl}`;
  // card shown ~430px desktop / ~300px phone
  variants(`${src}/card_mockup.jpg`, [360, 480, 768], w => `${p.sl}/${p.sl}-ebook-mockup-${w}w.webp`);
  // social share preview (LINE/Facebook handle JPEG most reliably)
  jpeg(`${src}/card_mockup.jpg`, 1200, `${p.sl}/${p.sl}-og.jpg`);
  if (fs.existsSync(`${src}/example`)) {
    fs.readdirSync(`${src}/example`).filter(f => /\.jpe?g$/i.test(f)).sort().forEach((f, i) => {
      const n = String(i + 1).padStart(2, '0');
      // page shown up to 520px (2-up desktop) / full width phone
      variants(`${src}/example/${f}`, [400, 646], w => `${p.sl}/example/${p.sl}-sample-page-${n}-${w}w.webp`);
    });
  }
}

// ---- header
variants(path.join(__dirname, 'src/eng-me-up-logo.png'), [72, 144], w => `assets/img/eng-me-up-logo-${w}w.webp`);            // shown 84px tall
variants(`${PACK}/04_หัวเว็บ_20ปี/20-years.png`, [64, 128], w => `assets/img/eng-me-up-20-years-${w}w.webp`); // shown 46px tall

// ---- footer banners: wide (tablet/desktop) + square (phone)
const UP = `${PACK}/02_แบนเนอร์ท้ายหน้า/upload`;
for (const f of fs.readdirSync(UP)) {
  const m = /^(.*)-(1400x250|1080x1080)\.webp$/.exec(f);
  if (!m) continue;
  if (m[2] === '1400x250') variants(`${UP}/${f}`, [800, 1400], (w, h) => `assets/img/banners/${m[1]}-${w}x${h}.webp`);
  else variants(`${UP}/${f}`, [480, 720], w => `assets/img/banners/${m[1]}-${w}x${w}.webp`, { square: true });
}

// ---- hub
const HUBSLUG = { tips: 'cu-tep-tips-and-tricks', v600: '600-essential-words-for-cu-tep-80-plus', idp: 'cu-tep-idioms-pocket-book', speak: 'cu-tep-speaking-guideline-e-book', unlock: 'cu-tep-unlock', idf: 'cu-tep-idioms', exw: 'cu-tep-writing-10-sets', exr: 'cu-tep-reading-10-sets', gbm: 'grammar-brain-map', t600: 'toeic-600-vocabs', guide: 'toeic-guidebook', jigsaw: 'toeic-last-jigsaw', tmock: '10-toeic-mock-tests', vielts: 'vocab-for-ielts', iwrite: 'ielts-writing-guide', iread: 'ielts-reading-guide', ilist: 'ielts-listening-guide', ispeak: 'ielts-speaking-guide', i7: 'ielts-7-unlock', gbml: 'grammar-brain-map-light', ifsong: 'if-clause-song', tense: 'grammar-12-tenses-equation' };
for (const [id, sl] of Object.entries(HUBSLUG)) variants(exImg(`hub_${id}_c-`), [160, 320], w => `assets/img/covers/${sl}-cover-${w}w.webp`); // shown 92–150px
variants(exImg('hubcss0-'), [1280, 1920], w => `assets/img/elibrary-hero-bg-${w}w.webp`);
variants(exImg('hubimg-bedc2f22'), [420, 640], w => `assets/img/kru-joe-eng-me-up-${w}w.webp`);
variants(exImg('hubimg-4655ba63'), [640, 1280], w => `assets/img/kru-joe-with-students-${w}w.webp`);
jpeg(exImg('hubimg-4655ba63'), 1200, 'assets/img/elibrary-og.jpg');

(async () => {
  for (let i = 0; i < jobs.length; i += 8) await Promise.all(jobs.slice(i, i + 8).map(j => j()));
  const sorted = Object.fromEntries(Object.keys(M).sort().map(k => [k, M[k]]));
  fs.writeFileSync(path.join(__dirname, '.cache/img-manifest.json'), JSON.stringify({ hub: HUBSLUG, files: sorted }, null, 1));
  console.log('images:', Object.keys(M).length);
})();
