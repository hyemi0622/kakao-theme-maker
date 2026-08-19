# 카카오톡 테마 메이커 (iOS / .ktheme)

백엔드 없이 브라우저에서 누끼 → 리사이즈 → JSZip → `.ktheme` 까지 끝냅니다.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # dist/ 를 Vercel·Netlify·GitHub Pages 에 그대로 올리면 끝
```

## 폴더 구조

```
kakao-theme-maker/
├── index.html
├── vite.config.js
├── public/
│   └── bubbles/                      ← 내가 만든 말풍선 PNG 를 여기 넣기
│       ├── chatroomBubbleReceive01@2x.png / @3x.png
│       ├── chatroomBubbleReceive01Selected@2x.png / @3x.png
│       ├── chatroomBubbleSend01@2x.png / @3x.png
│       └── chatroomBubbleSend01Selected@2x.png / @3x.png
└── src/
    ├── main.jsx
    ├── App.jsx                       ← 화면 상태 전체 (업로드 → 생성 → 다운로드 → 모달)
    ├── constants/
    │   └── themeSpec.js              ← ★ 파일명·픽셀 규격·역할(A/B) 매핑표
    ├── lib/
    │   ├── imageProcess.js           ← ★ 누끼 · 흰배경 제거 · 트림 · 고정슬롯 렌더
    │   ├── deco.js                   ← 별/동글뱅이 벡터 + 배경 별밭
    │   ├── cssTemplate.js            ← ★ KakaoTalkTheme.css 생성기
    │   └── buildTheme.js             ← 전체 파이프라인 + JSZip 패킹
    ├── components/
    │   ├── UploadSlot.jsx            ← 왼쪽/오른쪽 업로드 박스
    │   ├── DownloadRow.jsx           ← 파일 행 + 다운로드 확인 모달
    │   └── Deco.jsx                  ← DecoIcon / DecoBar / StarBg
    └── styles/app.css                ← 반응형(아이폰 8 ~ 17 Pro Max)
```

## 컴포넌트 트리

```
<App>
 ├── <StarBg/>                     배경 별밭 (SVG, 고정)
 ├── <h1>/<p>                      타이틀
 ├── <div.guide>                   3단계 안내
 ├── <div.slots>
 │    ├── <UploadSlot label="왼쪽"  hint="상대방"/>   → fileA
 │    └── <UploadSlot label="오른쪽" hint="나"/>       → fileB
 ├── <button.cta>                  생성하기 (진행률 표시)
 ├── <DownloadRow/>                생성 후 등장
 ├── <DownloadModal/>              다운로드 확인
 └── <DecoBar/>                    하단 별 5개
```

## 반응형

`html { font-size: clamp(0.83px, calc(100vw / 402), 1.07px) }` 로 잡고
모든 치수를 `rem` 으로 씁니다. 시안(402pt = 아이폰 16/17 Pro) 비율이
아이폰 8(375pt) ~ 17 Pro Max(440pt) 에서 그대로 유지됩니다.
세로는 flow 레이아웃이라 아이폰 8 처럼 짧은 화면에서도 안 잘립니다.

## 테마 이미지 배수

`profileImg01~03.png`, `commonIcoTheme.png` 만 **162×162 단일 파일**,
나머지는 전부 `@2x`(아이폰 8·SE) + `@3x`(Pro/Max) 두 벌을 자동 생성합니다.

## GitHub Pages 배포 (사진만 넣으면 바로 되는 링크 만들기)

1. GitHub 에 새 repo 생성 후 이 폴더를 push
   ```bash
   git init && git add -A && git commit -m "init"
   git branch -M main
   git remote add origin https://github.com/<아이디>/<레포>.git
   git push -u origin main
   ```
2. repo → **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 변경
3. 끝. `main` 에 push 할 때마다 `.github/workflows/deploy.yml` 이 자동 배포합니다.
   주소: `https://<아이디>.github.io/<레포>/`

`vite.config.js` 의 `base: './'` 덕분에 repo 이름이 뭐든 경로가 안 깨집니다.

> 누끼 AI 모델(약 24MB)은 첫 실행 때 CDN 에서 1회 받고 브라우저에 캐시됩니다.
> GitHub Pages 는 COOP/COEP 헤더를 못 켜서 멀티스레드 대신 싱글스레드로 도는데,
> 사진 2장이라 체감 차이는 몇 초 수준입니다.

## 말풍선

`public/bubbles/` 에 아래 이름으로 넣으면 그걸 쓰고, **없으면 같은 손그림 스타일로 자동 생성**됩니다.

```
chatroomBubbleReceive01@2x.png / @3x.png
chatroomBubbleReceive01Selected@2x.png / @3x.png
chatroomBubbleSend01@2x.png / @3x.png
chatroomBubbleSend01Selected@2x.png / @3x.png
```

**크기는 고정 1장만 있으면 됩니다.** 글자가 길어지면 카카오가 CSS 의
`-ios-background-image: '파일.png' 24px 24px;` 값(capInset)을 기준으로
가운데만 늘려주기 때문에 모서리는 절대 안 뭉개집니다.
숫자는 `src/constants/themeSpec.js` 의 `CAP` 에서 한 번에 바꿉니다.

## 폰트

- 영문·숫자 → **Inter** (Google Fonts)
- 한글 → **Pretendard** (dynamic subset, 쓰는 글자만 다운로드)

`font-family: 'Inter', 'Pretendard Variable', ...` 순서라서
Inter 에 없는 한글 글리프만 자동으로 Pretendard 로 넘어갑니다.
