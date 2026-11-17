# ENG ME UP · eLibrary

Static site for `https://www.englishmeup.com/elibrary/` — hub page plus 25 book pages (CU-TEP · TOEIC · IELTS · Grammar).

## Deploy
Upload everything **except** `_build/` to `/elibrary/` on the host.

## Rebuild
The source pack (`PJ_PART/pro1_Pack_v1.6`) is not in this repo. Copy it into the project root, then:

```
cd _build
npm install
npm run build
```

See [_build/README.md](_build/README.md) for the pipeline steps.
