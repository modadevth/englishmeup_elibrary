# eLibrary build

สร้างเว็บ static ของ eLibrary (โฟลเดอร์แม่ `elibrary/`) จากข้อมูลใน `PJ_PART/pro1_Pack_v1.6`

```
cd _build
npm install        # ครั้งแรกครั้งเดียว (ติดตั้ง sharp)
npm run build      # extract → images → pages + sitemap
```

| ขั้น | สคริปต์ | ทำอะไร |
|---|---|---|
| extract | `extract.js` | ดึงข้อมูลและรูปที่ฝังใน mockup 2 ไฟล์ ไปไว้ที่ `.cache/` |
| images | `images.js` | ลบรูปเก่าในเว็บ แล้วสร้าง WebP (q75) หลายขนาด + og JPEG + `.cache/img-manifest.json` |
| pages | `build.js` | สร้าง `index.html`, `<slug>/index.html`, `<slug>/read/`, CSS/JS, `sitemap.xml` |

แก้ข้อความหน้าเล่ม: แก้ `pages_v7.json` / mockup ใน `PJ_PART` แล้ว `npm run build`
แก้แค่ HTML/CSS (ไม่แตะรูป): `npm run pages` (เร็วกว่า ต้องเคยรัน build ครบมาแล้วอย่างน้อยครั้งเดียว)

**ไม่ต้องอัปโหลดขึ้นโฮสต์:** `_build/` และ `PJ_PART/`
