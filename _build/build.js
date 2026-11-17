// Build static eLibrary site into the parent folder (elibrary/)
// Sources: pro1_Pack_v1.6 (pages_v7.json, mockups, images, PDFs) + _build/.cache (extracted mockup data)
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const ROOT = path.resolve(__dirname, '..');
const PACK = `${ROOT}/PJ_PART/pro1_Pack_v1.6`;
const EX = path.join(__dirname, '.cache');
const SITE = 'https://www.englishmeup.com';
const LINE = 'https://line.me/ti/p/%40englishmeup';

const mk = d => fs.mkdirSync(d, { recursive: true });
const cp = (a, b) => { mk(path.dirname(b)); fs.copyFileSync(a, b); };
const w = (f, s) => { mk(path.dirname(f)); fs.writeFileSync(f, s); };
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const pages = JSON.parse(fs.readFileSync(`${PACK}/01_หน้าเล่ม/elibrary_pages/pages_v7.json`, 'utf8'));
const book = JSON.parse(fs.readFileSync(`${EX}/book.json`, 'utf8'));
const hubx = JSON.parse(fs.readFileSync(`${EX}/hub.json`, 'utf8'));
if (pages.length !== book.P.length) throw new Error('page count mismatch');

// ---------- shared assets (images come from images.js → img-manifest.json)
const A = `${ROOT}/assets`;
const IM = JSON.parse(fs.readFileSync(path.join(__dirname, '.cache/img-manifest.json'), 'utf8'));
// all width variants for a stem: [[rel, w, h], ...] sorted by width
const V = stem => {
  const r = Object.entries(IM.files).filter(([k]) => k.startsWith(stem) && /^-?\d+(w|x\d+)\.webp$/.test(k.slice(stem.length))).map(([k, [w, h]]) => [k, w, h]).sort((a, b) => a[1] - b[1]);
  if (!r.length) throw new Error('no image variants for ' + stem);
  return r;
};
const srcset = (v, pre) => v.map(([r, w]) => `${pre}${r} ${w}w`).join(', ');
// responsive <img>: src = 2nd-smallest variant (sane fallback), intrinsic size from largest
const rimg = (stem, pre, { alt = '', sizes, cls, lazy = true, high = false } = {}) => {
  const v = V(stem), big = v[v.length - 1], fb = v[Math.min(1, v.length - 1)];
  return `<img${cls ? ` class="${cls}"` : ''} src="${pre}${fb[0]}" srcset="${srcset(v, pre)}" sizes="${sizes}" width="${big[1]}" height="${big[2]}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''}${high ? ' fetchpriority="high"' : ''} decoding="async">`;
};

// banner key -> file stem, alt
const BKEY = {
  CUTEP: { success: 'cutep-success-story', course: 'cutep-guaranteed-results-course', cases: 'cutep-real-case-studies', practice: 'cutep-daily-practice-app', exam: 'cutep-free-exam-download', steps: 'cutep-3-steps-before-choosing' },
  TOEIC: { success: 'toeic-success-story', course: 'toeic-guaranteed-results-course', cases: 'toeic-real-case-studies', practice: 'toeic-daily-practice-app', exam: 'toeic-free-exam-download', steps: 'toeic-3-steps-before-choosing' },
  IELTS: { success: 'ielts-success-story', course: 'ielts-guaranteed-results-course', practice: 'ielts-daily-practice-app', steps: 'ielts-3-steps-before-choosing' },
  GRAMMAR: { success: 'grammar-success-story', course: 'grammar-foundation-course', practice: 'grammar-daily-practice-app', demo: 'grammar-free-trial-class' },
};
const SUCCESS = 'เสียงส่วนหนึ่งจากนักเรียน กว่า 10,000 คน 10 องค์กรชั้นนำ ตลอด 20 ปี บนสถิติสอบผ่าน 89%';
const STEPS = 'อนาคตไม่ใช่สินค้า อย่าฝากไว้ที่คำโฆษณา พิจารณาให้ถี่ถ้วนด้วย 3 ขั้นตอน';
const ALT = {
  CUTEP: { success: SUCCESS, course: 'คอร์สรับรองผล CU-TEP 80+ ที่เดียว! ที่มีระบบรองรับจริง ไม่ใช่แค่ให้เรียนซ้ำ', cases: 'วิเคราะห์ 33 เคสจริง จากคะแนน CU-TEP วนไปมา สู่บรรลุเป้าหมาย', practice: 'ฝึก CU-TEP เป็นระดับ แก้ตรงจุด ด้วย APP เสริมนอกห้องเรียน ลองฟรี', exam: 'ข้อสอบ CU-TEP ที่ตรงแนวปัจจุบัน หายาก? ดาวน์โหลดฟรี', steps: STEPS },
  TOEIC: { success: SUCCESS, course: 'คอร์สรับรองผล TOEIC 700+ ที่เดียว! ที่มีระบบรองรับจริง ไม่ใช่แค่ให้เรียนซ้ำ', cases: 'วิเคราะห์ 20 เคสจริง จากคะแนน TOEIC วนไปมา สู่บรรลุเป้าหมาย', practice: 'ฝึก TOEIC เป็นระดับ แก้ตรงจุด ด้วย APP เสริมนอกห้องเรียน ลองฟรี', exam: 'ข้อสอบ TOEIC ที่ตรงแนวปัจจุบัน หายาก? ดาวน์โหลดฟรี', steps: STEPS },
  IELTS: { success: SUCCESS, course: 'คอร์สรับรองผล IELTS 6.5+ ที่เดียว! ที่มีระบบรองรับจริง ไม่ใช่แค่ให้เรียนซ้ำ', practice: 'ฝึก IELTS เป็นระดับ แก้ตรงจุด ด้วย APP เสริมนอกห้องเรียน ลองฟรี', steps: STEPS },
  GRAMMAR: { success: SUCCESS, course: 'คอร์ส Grammar ปูพื้นให้แน่น ร้อยเรียงการคิด Grammar เป็นระบบ', practice: 'ฝึก Grammar ทุกวัน ด้วย APP เสริมนอกห้องเรียน ลองฟรี', demo: 'ทดลองเรียน Grammar ฟรี กับครูโจ' },
};
// README §2 Grammar links (overrides mockup)
const GRAMMAR_LINKS = { success: `${SITE}/testimonial`, course: `${SITE}/grammar/#about`, practice: 'https://me.englishmeup.com/?src=pro1#grammar', demo: `${SITE}/grammar/#demo` };

// ---------- CSS from book mockup
const bookHtml = fs.readFileSync(`${PACK}/01_หน้าเล่ม/pro1_หน้าเล่ม_mockup_v7.3.html`, 'utf8');
let bookCss = bookHtml.slice(bookHtml.indexOf('<style>') + 7, bookHtml.indexOf('</style>'));
bookCss = bookCss.split('\n').filter(l => !/^\.pick|^\.note/.test(l)).join('\n');
bookCss += `
/* site additions */
img{max-width:100%;height:auto}
header .lg img{height:84px;width:auto}
.card .im{cursor:pointer}
.pop form.gt{margin-top:6px}.msg{margin-top:12px;font-size:14.5px;color:#1E8A55}.msg.err{color:#C8202F}
.gp2 .msg{max-width:300px}
.pop .alt{display:block;margin-top:14px;font-size:14px;color:#1C4794;text-decoration:underline}
.bn picture,.bn img{display:block;width:100%}
.crumb{max-width:1140px;margin:44px auto -24px;padding:0 16px;font-size:14px;color:#5B6170}.crumb a{color:#1C4794}
.rd-frame{display:block;width:100%;height:calc(100vh - 140px);min-height:520px;border:0;background:#F3F5FA}
.rd-bar{max-width:1140px;margin:20px auto 12px;padding:0 16px;display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap}
.rd-bar h1{font:600 22px/1.3 Prompt;color:#1C4794;margin:0}.rd-bar a{color:#1C4794;text-decoration:underline;font-size:15px}
.rd-wrap{max-width:1140px;margin:0 auto 30px;padding:0 16px}
@media(max-width:860px){header .lg img{height:60px}.crumb{margin-bottom:-24px}}
`;
w(`${A}/css/book.css`, bookCss);

// ---------- book JS
w(`${A}/js/book.js`, `(function(){
var B=window.BOOK||{};var $=function(s,r){return (r||document).querySelector(s)},$$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};
var pop=$('#pop'),ex=$('#ex');
function openPop(e){if(e)e.preventDefault();pop.hidden=false;var i=$('input',pop);if(i)setTimeout(function(){i.focus()},50)}
$$('[data-pop]').forEach(function(a){a.addEventListener('click',openPop)});
$$('[data-close]').forEach(function(b){b.addEventListener('click',function(){b.closest('.pop,.exv').hidden=true})});
pop.addEventListener('click',function(e){if(e.target===pop)pop.hidden=true});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){pop.hidden=true;if(ex)ex.hidden=true}});
// email forms: Brevo form is not wired yet (README §5). window.ELIB_SUBMIT(email, slug) can be defined later to hook it up.
document.addEventListener('submit',function(e){var f=e.target;if(!f.matches('form[data-mail]'))return;e.preventDefault();
 var inp=$('input[type=email]',f),m=f.parentNode.querySelector('.msg')||(function(){var d=document.createElement('p');d.className='msg';f.after(d);return d})();
 var v=(inp.value||'').trim();if(!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(v)){m.className='msg err';m.textContent='กรุณากรอกอีเมลให้ถูกต้อง';inp.focus();return}
 if(typeof window.ELIB_SUBMIT==='function'){window.ELIB_SUBMIT(v,B.slug,f);m.className='msg';m.textContent='ส่งแล้ว · กรุณาเช็กอีเมลและกดยืนยัน';return}
 m.className='msg';m.innerHTML='ระบบส่งอีเมลกำลังเปิดใช้งานเร็วๆ นี้ · ระหว่างนี้ทัก <a href="${LINE}" target="_blank" rel="noopener">LINE @englishmeup</a> เพื่อรับเอกสารได้เลยครับ'});
// example viewer
var pg=(B.pages||[]).map(function(p,n){return '<img src="'+p.src+'" srcset="'+p.set+'" sizes="(max-width:767px) calc(100vw - 20px), 520px" width="'+p.w+'" height="'+p.h+'" alt="หน้าตัวอย่าง '+(n+1)+' · '+esc(B.title||'')+'" decoding="async">'});if(B.gate)pg.push(B.gate);
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
var at=0;function step(){return innerWidth<768?1:2}
function draw(){var st=step();$('#bk').innerHTML=pg.slice(at,at+st).map(function(h){return '<div class="pgw">'+h+'</div>'}).join('');$('#cn').textContent=(at+1)+(st>1&&at+1<pg.length?'–'+(at+2):'')+' / '+pg.length}
function openEx(e){if(e)e.preventDefault();if(!pg.length||!ex)return;ex.hidden=false;at=0;draw();ex.scrollTo(0,0)}
if(ex){$('#pv').onclick=function(){at=Math.max(0,at-step());draw()};$('#nx').onclick=function(){at=Math.min(pg.length-1,at+step());draw()};
 $$('[data-ex]').forEach(function(a){a.addEventListener('click',openEx)});addEventListener('resize',function(){if(!ex.hidden)draw()});
 if(/^#(sample|example)$/.test(location.hash))openEx()}
// banner carousel
var sw=$('.bn .sw');if(sw){var ds=$$('.bn .dots i'),i=0,T;var go=function(n){i=(n+ds.length)%ds.length;sw.scrollTo({left:sw.clientWidth*i,behavior:'smooth'});ds.forEach(function(d,k){d.classList.toggle('on',k===i)})};
 var start=function(){clearInterval(T);T=setInterval(function(){go(i+1)},4000)};ds.forEach(function(d,k){d.onclick=function(){go(k);start()}});go(0);start()}
})();`);

// ---------- book pages
const fixRight = (h, p) => h
  .replace(/href="#" onclick="document\.getElementById\('pop'\)\.hidden=false;return false"/g, 'href="#get" data-pop')
  .replace(/<a class="line" href="#">/g, `<a class="line" href="${LINE}" target="_blank" rel="noopener">`)
  .replace(/href="https:\/\/test\.englishmeup\.com\/"/g, `href="https://test.englishmeup.com/?src=pro1-${p.sl}" target="_blank" rel="noopener"`);
const fixGate = h => h
  .replace(/<form class="gt" onsubmit="return false">/g, '<form class="gt" data-mail>')
  .replace(/<input type="email" placeholder="อีเมลของคุณ">/g, '<input type="email" name="email" required autocomplete="email" placeholder="อีเมลของคุณ" aria-label="อีเมลของคุณ">')
  .replace(/<a class="line" href="#">/g, `<a class="line" href="${LINE}" target="_blank" rel="noopener">`);

const SUBNAME = { cutep: 'CU-TEP', toeic: 'TOEIC', ielts: 'IELTS', grammar: 'Grammar' };
const PDF_DIR = `${PACK}/03_เอกสาร_PDF`;
const pdfs = new Set(fs.readdirSync(PDF_DIR));
const xset = (stem, pre) => { const v = V(stem); return { src: pre + v[0][0], set: `${pre}${v[0][0]} 1x, ${pre}${v[v.length - 1][0]} 2x`, w: v[0][1], h: v[0][2] }; };
const header = pre => { const lg = xset('assets/img/eng-me-up-logo', pre), yr = xset('assets/img/eng-me-up-20-years', pre); return `<header><a class="lg" href="${pre}"><img src="${lg.src}" srcset="${lg.set}" width="${lg.w}" height="${lg.h}" alt="ENG ME UP"></a><div class="yr"><img src="${yr.src}" srcset="${yr.set}" width="${yr.w}" height="${yr.h}" alt="ENG ME UP 20 Years">TRUSTED BY <em>10+ LEADING ORGANIZATIONS &amp; UNIVERSITIES</em></div>
<nav><a href="${pre}">ห้องสมุด</a><a href="https://me.englishmeup.com/?src=elib">แอปฝึก</a><a class="co" href="${SITE}/?src=elib">คอร์สเรียน</a></nav></header>`; };
const FOOT = `<footer>Copyright © 2012 By English-Me-Up Hybrid Education Co., Ltd. All Right Reserved</footer>`;
const FONTS = `<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&family=Oswald:wght@500;600&family=Shadows+Into+Light&display=swap">`;

const report = [];
pages.forEach((pg, idx) => {
  const P = book.P[idx], sl = pg.sl, dir = `${ROOT}/${sl}`;
  const src = `${PACK}/01_หน้าเล่ม/elibrary_pages/${sl}`;
  let ex = [];
  if (fs.existsSync(`${src}/example`)) ex = fs.readdirSync(`${src}/example`).filter(f => /\.jpe?g$/.test(f)).sort();
  const nRead = P.read ? P.read.pages.length : 0;
  if (nRead && nRead !== ex.length) throw new Error(`${sl}: mockup ${nRead} pages vs pack ${ex.length}`);
  const isExam = pg.typ.startsWith('ข้อสอบ'), isPaid = pg.typ.startsWith('E-Book');
  const keepSeo = pg.seo[0] === 'คงของเดิม';
  const title = keepSeo ? `${pg.t} · ${isPaid ? 'E-Book' : isExam ? 'ข้อสอบฟรี' : 'แจกฟรี'} | ENG ME UP` : `${pg.seo[0]} | ENG ME UP`;
  const desc = keepSeo ? `${pg.d} · ${SUBNAME[pg.sub]} จากครูโจ ENG ME UP` : pg.seo[1];
  const url = `${SITE}/elibrary/${sl}/`;
  const lab = P.ex ? 'ดูตัวอย่างข้อสอบ' : 'ดูตัวอย่างหนังสือ';
  const hasEx = ex.length > 0;
  const subj = P.ban[0][0].split('_')[0];
  const bans = P.ban.map(([k, link]) => {
    const kind = k.split('_')[1], stem = BKEY[subj][kind];
    if (subj === 'GRAMMAR') link = GRAMMAR_LINKS[kind];
    const wide = V(`assets/img/banners/${stem}-`).filter(x => x[1] !== x[2]), sq = V(`assets/img/banners/${stem}-`).filter(x => x[1] === x[2]);
    const wb = wide[wide.length - 1], sb = sq[sq.length - 1];
    return `<a href="${link}"><picture><source media="(min-width:768px)" srcset="${srcset(wide, '../')}" sizes="(max-width:1140px) calc(100vw - 32px), 1108px" width="${wb[1]}" height="${wb[2]}"><img src="../${sq[0][0]}" srcset="${srcset(sq, '../')}" sizes="calc(100vw - 32px)" width="${sb[1]}" height="${sb[2]}" alt="${esc(ALT[subj][kind])}" loading="lazy" decoding="async"></picture></a>`;
  });
  const cardStem = `${sl}/${sl}-ebook-mockup-`, og = `${sl}-og.jpg`, ogSize = IM.files[`${sl}/${og}`];
  const exPages = ex.map((_, i) => { const v = V(`${sl}/example/${sl}-sample-page-${String(i + 1).padStart(2, '0')}-`).map(x => [x[0].slice(sl.length + 1), x[1], x[2]]); const b = v[v.length - 1]; return { src: v[0][0], set: srcset(v, ''), w: b[1], h: b[2] }; });
  const popTitle = isExam ? 'รับ PDF ข้อสอบทางอีเมล' : 'รับฟรีทางอีเมล';
  const popText = isExam ? 'กรอกอีเมล แล้วกดยืนยันในอีเมลที่เราส่งไป · ระบบจะส่งไฟล์ PDF ข้อสอบให้ทันที (พิมพ์ออกมาทำได้)' : 'กรอกอีเมล แล้วกดยืนยันในอีเมลที่เราส่งไป · กดแล้วเปิดอ่านได้ทั้งเล่มทันที (เปิดซ้ำได้จากลิงก์เดิม)';
  const data = { slug: sl, title: pg.t, pages: exPages, gate: hasEx ? fixGate(P.read.gate) : '' };
  const ld = { '@context': 'https://schema.org', '@type': 'Book', name: pg.t, description: desc, url, image: `${url}${og}`, inLanguage: 'th', publisher: { '@type': 'Organization', name: 'ENG ME UP' }, bookFormat: 'https://schema.org/EBook',
    offers: { '@type': 'Offer', priceCurrency: 'THB', price: isPaid ? (pg.price.match(/\d+/) || ['0'])[0] : '0', availability: 'https://schema.org/InStock' } };
  const html = `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(desc)}"><link rel="canonical" href="${url}">
<meta property="og:type" content="book"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${url}"><meta property="og:image" content="${url}${og}"><meta property="og:image:width" content="${ogSize[0]}"><meta property="og:image:height" content="${ogSize[1]}"><meta property="og:image:alt" content="${esc(pg.t)}"><meta property="og:locale" content="th_TH">
<link rel="preload" as="image" href="${V(cardStem)[1][0].slice(sl.length + 1)}" imagesrcset="${srcset(V(cardStem).map(x => [x[0].slice(sl.length + 1), x[1]]), '')}" imagesizes="(max-width:860px) calc(100vw - 92px), 430px" fetchpriority="high">
${FONTS}<link rel="stylesheet" href="../assets/css/book.css">
<script type="application/ld+json">${JSON.stringify(ld)}</script></head><body>
${header('../')}
<nav class="crumb"><a href="../">ห้องสมุด</a> › <a href="../#${pg.sub}">${SUBNAME[pg.sub]}</a> › ${esc(pg.t)}</nav>
<main><section class="top"><div class="card"><span class="lb">${P.label}</span><div class="im"${hasEx ? ' data-ex' : ''}>${rimg(cardStem, '', { alt: `${pg.t} · ${isPaid ? 'E-Book' : isExam ? 'ข้อสอบฟรี' : 'เอกสารฟรี'} จาก ENG ME UP`, sizes: '(max-width:860px) calc(100vw - 92px), 430px', lazy: false, high: true }).replace(new RegExp(`${sl}/`, 'g'), '')}${hasEx ? `<button class="ov" type="button" data-ex>${lab}</button>` : ''}</div>${hasEx ? `<a href="#sample" data-ex>${lab}</a>` : ''}</div><div>${fixRight(P.right, pg)}</div></section>
<section class="bn" aria-label="แนะนำจาก ENG ME UP"><div class="sw">${bans.join('')}</div><div class="dots">${bans.map(() => '<i></i>').join('')}</div></section></main>
${hasEx ? `<div class="exv" id="ex" hidden><div class="bar2"><span>หน้าตัวอย่าง · ${esc(pg.t)}</span><button type="button" data-close>← กลับหน้าเล่ม</button></div><section class="fb"><div class="bk2" id="bk"></div><button class="ar l" id="pv" type="button" aria-label="ก่อนหน้า">‹</button><button class="ar r" id="nx" type="button" aria-label="ถัดไป">›</button><div class="cnt2" id="cn"></div></section></div>` : ''}
<div class="pop" id="pop" hidden role="dialog" aria-modal="true" aria-label="${popTitle}"><div><button class="x" type="button" data-close aria-label="ปิด">×</button><b>${popTitle}</b><p>${popText}</p>
<!-- BREVO: วางฟอร์ม Brevo แทน <form data-mail> ด้านล่าง หรือกำหนด window.ELIB_SUBMIT(email, slug) (README ข้อ 5) -->
<form class="gt" data-mail><input type="email" name="email" required autocomplete="email" placeholder="อีเมลของคุณ" aria-label="อีเมลของคุณ"><button>ส่งให้ฉัน</button></form>${isExam ? `<a class="alt" href="https://test.englishmeup.com/?src=pro1-${sl}" target="_blank" rel="noopener">หรือทำออนไลน์ที่ test.englishmeup.com รู้ผลทันที</a>` : ''}</div></div>
${FOOT}
<script>window.BOOK=${JSON.stringify(data).replace(/</g, '\\u003c')}</script><script src="../assets/js/book.js"></script>
</body></html>`;
  w(`${dir}/index.html`, html);

  // full reader /read/ (free documents only, noindex, not linked) — README §5
  let readMade = false;
  if (!isPaid && !isExam && pdfs.has(`${sl}.pdf`)) {
    cp(`${PDF_DIR}/${sl}.pdf`, `${dir}/read/${sl}.pdf`);
    w(`${dir}/read/index.html`, `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(pg.t)} · อ่านฉบับเต็ม | ENG ME UP</title><meta name="robots" content="noindex,nofollow">
${FONTS}<link rel="stylesheet" href="../../assets/css/book.css"></head><body>
${header('../../')}
<div class="rd-bar"><h1>${esc(pg.t)}</h1><a href="${sl}.pdf" target="_blank" rel="noopener">เปิดแบบเต็มจอ ↗</a></div>
<div class="rd-wrap"><iframe class="rd-frame" src="${sl}.pdf#view=FitH" title="${esc(pg.t)}"></iframe></div>
<section class="nx"><div><small>อ่านจบแล้ว ไปต่อ</small><b>คอร์ส ${SUBNAME[pg.sub]} กับครูโจ</b><span>ให้ครูโจพาทำทั้งหมดในคอร์สรับรองผล</span></div><a href="${SITE}/${pg.sub}/?src=elib-read">ดูคอร์ส →</a></section>
${FOOT}</body></html>`);
    readMade = true;
  }
  report.push([sl, P.label, ex.length, readMade ? 'read/' : '']);
});

// ---------- hub
const hubHtml = fs.readFileSync(`${PACK}/06_หน้ารวม/pro1_หน้ารวม_mockup_v19.html`, 'utf8');
const fixSlug = { idf: 'cu-tep-idioms', tense: 'grammar-12-tenses-equation' };
const COVER_SIZES_SHELF = '(max-width:600px) 92px, 128px', COVER_SIZES_DETAIL = '(max-width:900px) 110px, 150px';
// identify an embedded mockup image (by md5 → extracted file name) and return responsive <img> attributes
const hubAttrs = uri => {
  const m = /^data:([a-z/+]+);base64,(.*)$/s.exec(uri);
  const h = crypto.createHash('md5').update(Buffer.from(m[2], 'base64')).digest('hex').slice(0, 8);
  const f = fs.readdirSync(`${EX}/img`).find(x => x.includes(h));
  let stem, sizes, lazy = true, high = false;
  if (h === 'bedc2f22') { stem = 'assets/img/kru-joe-eng-me-up-'; sizes = '(max-width:900px) min(420px,100vw), min(45vw,620px)'; lazy = false; high = true; }
  else if (h === '4655ba63') { stem = 'assets/img/kru-joe-with-students-'; sizes = '(max-width:900px) 100vw, 780px'; }
  else { const id = /^hub_(\w+?)_c-/.exec(f)[1]; stem = `assets/img/covers/${IM.hub[id]}-cover-`; sizes = COVER_SIZES_SHELF; }
  return rimg(stem, '', { sizes, lazy, high }).replace(/^<img |\s*alt=""|>$/g, '');
};
let hcss = hubHtml.slice(hubHtml.indexOf('<style>') + 7, hubHtml.indexOf('</style>'));
hcss = hcss.replace(/url\((data:[^)]+)\)/g, '').split('\n').filter(l => !/^\.note/.test(l)).join('\n');
hcss += `
/* site additions */
img{max-width:100%;height:auto}
.hx{background-image:url(../img/elibrary-hero-bg-1920w.webp)}
@media(max-width:1280px){.hx{background-image:url(../img/elibrary-hero-bg-1280w.webp)}}
.how{justify-content:center}
@media(max-width:1100px){.how ol{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 18px;font-size:15px}}
@media(max-width:900px){.how{flex-direction:column;gap:10px}}
.detail .dc img{aspect-ratio:1/1.414;object-fit:cover}
`;
w(`${A}/css/hub.css`, hcss);

let body = hubHtml.slice(hubHtml.indexOf('<body>') + 6, hubHtml.lastIndexOf('<script>'));
body = body
  .replace(/<div class="note">[\s\S]*?<\/div>\n?/, '')
  .replace(/<p class="foot wrap">[\s\S]*?<\/p>\n?/, '')
  .replace(/<div class="md" id="lb"[\s\S]*?<\/figure><\/div>\n?/, '')
  .replace(/<div class="md" id="md"[\s\S]*?<\/div><\/div>\n?/, '')
  .replace(/<button class="play"[\s\S]*?<\/button>/, '')
  .replace(/src="(data:[^"]+)"/g, (_, u) => hubAttrs(u))
  .replace(/href="\/(cutep|toeic|ielts|grammar)\//g, `href="${SITE}/$1/`);
if (/data:image/.test(body)) throw new Error('hub still has inline images');
// hub detail data
const D = {};
for (const [id, d] of Object.entries(hubx.D)) {
  const v = V(`assets/img/covers/${IM.hub[id]}-cover-`), b = v[v.length - 1];
  D[id] = { ...d, c: v[0][0], cs: srcset(v, ''), cw: b[1], ch: b[2], sl: fixSlug[id] || d.sl };
  delete D[id].live;
}
Object.assign(D.guide, { t: 'The Guidebook for TOEIC 700+ ฉบับใหม่ 2026', d: 'รู้จักข้อสอบครบ 7 Part · นิสัยข้อสอบ · คลิปวิเคราะห์ครูโจ', k: 'mail', new: 'ใหม่', bl: ['ครบ 7 Part · 25 หน้า', 'คลิปครูโจ 5 คลิป (QR)', 'ทิศทางการฝึกสู่ 700+'] });
Object.assign(D.gbm, { bl: ['10 บท · 57 หน้า', 'คลิปเรียน 25 คลิป', 'ยาว 7 ชั่วโมง'] });
for (const id in D) if (!D[id].pack && !fs.existsSync(`${ROOT}/${D[id].sl}/index.html`)) throw new Error('hub link missing ' + D[id].sl);

w(`${A}/js/hub.js`, `(function(){
var D=window.HUB_D,K={mail:['PDF','รับฟรีทางอีเมล'],read:['อ่านบนเว็บ','อ่านฟรี'],paid:['E-Book','ทดลองอ่านฟรี']};
function render(card,id){var d=D[id],k=d.pack?['ชุดข้อสอบ','ดูตัวอย่างข้อสอบ']:K[d.k];
 var meta='<span>'+d.s+'</span><span class="'+(d.p?'eb2':'fr')+'">'+(d.pack?'ข้อสอบ':d.p?'E-Book':'ฟรี')+'</span><span>'+k[0]+'</span>'+(d.new?'<span>ใหม่</span>':'');
 var U=d.pack?'${SITE}/cutepexams/':d.sl+'/';
 var act=d.p?'<div class="pr"><b>฿'+d.p+'</b>'+(d.o?'<s>฿'+d.o+'</s>':'')+'</div><a class="btn" href="'+U+'?src=elib">ดูรายละเอียด · สั่งซื้อ →</a><a class="btn2" href="'+U+'?src=elib#sample">'+k[1]+'</a>'
  :'<a class="btn" href="'+U+'?src=elib">'+k[1]+' →</a>';
 card.innerHTML='<div class="dc"><a href="'+U+'?src=elib"><img src="'+d.c+'" srcset="'+d.cs+'" sizes="${COVER_SIZES_DETAIL}" width="'+d.cw+'" height="'+d.ch+'" alt="ปก '+d.t+'" decoding="async"></a></div><div><div class="dm">'+meta+'</div><h3>'+d.t+'</h3><p>'+d.d+'</p><ul>'+d.bl.map(function(x){return '<li>'+x+'</li>'}).join('')+'</ul></div><div class="dact">'+act+'</div>'}
document.querySelectorAll('.sec').forEach(function(sec){var card=sec.querySelector('.detail');var set=function(id,scroll){sec.querySelectorAll('.bk').forEach(function(b){b.classList.toggle('on',b.dataset.id===id)});render(card,id);if(scroll&&card.getBoundingClientRect().top>innerHeight-120)card.scrollIntoView({behavior:'smooth',block:'nearest'})};
 set(card.dataset.first);sec.querySelectorAll('.bk[data-id]').forEach(function(b){b.addEventListener('click',function(){set(b.dataset.id,true)})})});
var chips=[].slice.call(document.querySelectorAll('.chips button')),fs='all',ft='';
function apply(){document.querySelectorAll('.sec').forEach(function(s){s.hidden=!(fs==='all'||s.dataset.sub===fs)});
 document.querySelectorAll('.bk').forEach(function(b){b.classList.toggle('dim',!!ft&&!b.classList.contains(ft))});
 chips.forEach(function(c){c.classList.toggle('on',!!((c.dataset.f&&c.dataset.f===fs)||(c.dataset.t&&c.dataset.t===ft)))})}
chips.forEach(function(c){c.addEventListener('click',function(){if(c.dataset.f){fs=c.dataset.f}else{ft=ft===c.dataset.t?'':c.dataset.t}apply()})});
var h=location.hash.slice(1);if(/^(cutep|toeic|ielts|grammar)$/.test(h)){fs=h;apply()}
})();`);

const hubDesc = 'ห้องสมุด ENG ME UP รวมเอกสารเตรียมสอบ CU-TEP · TOEIC · IELTS · Grammar จากครูโจ ทั้งฉบับแจกฟรีและ E-Book ฉบับเต็ม อ่านบนเว็บได้ทันที';
w(`${ROOT}/index.html`, `<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>ห้องสมุด ENG ME UP · เอกสารเตรียมสอบ CU-TEP TOEIC IELTS Grammar ฟรี</title><meta name="description" content="${hubDesc}"><link rel="canonical" href="${SITE}/elibrary/">
<meta property="og:type" content="website"><meta property="og:title" content="ห้องสมุด ENG ME UP"><meta property="og:description" content="${hubDesc}"><meta property="og:url" content="${SITE}/elibrary/"><meta property="og:locale" content="th_TH">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600&family=Oswald:wght@500;600&display=swap">
<meta property="og:image" content="${SITE}/elibrary/assets/img/elibrary-og.jpg"><meta property="og:image:width" content="${IM.files["assets/img/elibrary-og.jpg"][0]}"><meta property="og:image:height" content="${IM.files["assets/img/elibrary-og.jpg"][1]}">
<link rel="preload" as="image" href="assets/img/elibrary-hero-bg-1280w.webp" media="(max-width:1280px)" fetchpriority="high"><link rel="preload" as="image" href="assets/img/elibrary-hero-bg-1920w.webp" media="(min-width:1281px)" fetchpriority="high">
<link rel="stylesheet" href="assets/css/hub.css"></head><body>
${body.trim()}
<script>window.HUB_D=${JSON.stringify(D).replace(/</g, '\\u003c')}</script><script src="assets/js/hub.js"></script>
</body></html>`);

console.table(report);

// ---------- sitemap (hub + book pages; /read/ pages are noindex and excluded)
const today = new Date().toISOString().slice(0, 10);
const locs = [[`${SITE}/elibrary/`, '1.0'], ...pages.map(p => [`${SITE}/elibrary/${p.sl}/`, '0.8'])];
w(`${ROOT}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${locs.map(([l, pr]) => `  <url><loc>${l}</loc><lastmod>${today}</lastmod><priority>${pr}</priority></url>`).join('\n')}\n</urlset>\n`);
console.log('sitemap:', locs.length, 'URLs');
