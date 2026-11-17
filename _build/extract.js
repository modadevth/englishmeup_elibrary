// Extract data + embedded images from the two mockups (PJ_PART) into _build/.cache/
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const PACK = `${ROOT}/PJ_PART/pro1_Pack_v1.6`;
const OUT = path.join(__dirname, '.cache');
fs.mkdirSync(path.join(OUT, 'img'), { recursive: true });

const ext = m => ({ 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/svg+xml': 'svg', 'image/gif': 'gif' }[m] || 'bin');
const seen = {};
function saveData(uri, hint) {
  const m = /^data:([a-z/+]+);base64,(.*)$/s.exec(uri);
  if (!m) return uri;
  const buf = Buffer.from(m[2], 'base64');
  const h = crypto.createHash('md5').update(buf).digest('hex').slice(0, 8);
  if (seen[h]) return seen[h];
  const name = `${hint}-${h}.${ext(m[1])}`;
  fs.writeFileSync(path.join(OUT, 'img', name), buf);
  return (seen[h] = name);
}
const deep = (o, hint) => {
  if (typeof o === 'string') return o.startsWith('data:') ? saveData(o, hint) : o;
  if (Array.isArray(o)) return o.map((x, i) => deep(x, hint));
  if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = deep(o[k], (hint ? hint + '_' : '') + k); return r; }
  return o;
};

// ---- book mockup
const book = fs.readFileSync(`${PACK}/01_หน้าเล่ม/pro1_หน้าเล่ม_mockup_v7.3.html`, 'utf8');
let s = book.slice(book.lastIndexOf('<script>') + 8);
s = s.slice(0, s.indexOf('function show'));
const ctx = {}; vm.runInNewContext(s.replace(/const (\w+)=/g, 'this.$1='), ctx);
const P = ctx.P.map(p => deep(p, 'cov_' + p.id));
const FL = deep(ctx.FL, 'fl');
const BN = deep(ctx.BN, 'bn');
// header images in book mockup
const hdr = [...book.slice(0, book.indexOf('<main')).matchAll(/src="(data:[^"]+)"/g)].map((m, i) => saveData(m[1], 'hdr' + i));
fs.writeFileSync(path.join(OUT, 'book.json'), JSON.stringify({ P, FL, BN, hdr }, null, 1));

// ---- hub mockup
const hub = fs.readFileSync(`${PACK}/06_หน้ารวม/pro1_หน้ารวม_mockup_v19.html`, 'utf8');
let hs = hub.slice(hub.lastIndexOf('<script>') + 8);
const dStart = hs.indexOf('const D='), dEnd = hs.indexOf('function render');
const hctx = {}; vm.runInNewContext(hs.slice(dStart, dEnd).replace(/const (\w+)=/g, 'this.$1='), hctx);
const D = {}; for (const k in hctx.D) D[k] = deep(hctx.D[k], 'hub_' + k);
const body = hub.slice(0, hub.lastIndexOf('<script>'));
const imgs = [];
body.replace(/(data-id="(\w+)"[^>]*>)?(?:<span class="b3">)?<img[^>]*src="(data:[^"]+)"/g, (m, a, id, uri) => { imgs.push([id || '', saveData(uri, 'hubimg' + (id ? '_' + id : ''))]); return m; });
const css = [...body.matchAll(/url\((data:[^)]+)\)/g)].map((m, i) => saveData(m[1], 'hubcss' + i));
fs.writeFileSync(path.join(OUT, 'hub.json'), JSON.stringify({ D, imgs, css }, null, 1));
console.log('P', P.length, 'FL', Object.keys(FL).length, 'BN', Object.keys(BN).length, 'hdr', hdr, 'D', Object.keys(D).length, 'imgs', imgs.length, 'css', css);
