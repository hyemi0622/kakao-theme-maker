# 카카오톡 테마 메이커 (iOS / .ktheme)

백엔드 없이 브라우저에서 누끼 → 리사이즈 → JSZip → `.ktheme` 까지 끝냅니다.

## 폴더 구조

```
kakao-theme-maker/
├── index.html
├── vite.config.js
├── public/
│   └── bubbles/                      
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

## 폰트

- 영문·숫자 → **Inter** (Google Fonts)
- 한글 → **Pretendard** (dynamic subset, 쓰는 글자만 다운로드)

`font-family: 'Inter', 'Pretendard Variable', ...` 순서라서
Inter 에 없는 한글 글리프만 자동으로 Pretendard 로 넘어갑니다.
