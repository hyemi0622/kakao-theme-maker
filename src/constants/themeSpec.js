/**
 * themeSpec.js
 * ─────────────────────────────────────────────────────────────
 * 카카오톡 iOS 테마(.ktheme) 에셋 규격 정의.
 *
 * [규격 근거] 카카오 공식 「iOS 테마 사용자 가이드 9.2.5」
 *  - profileImg01~03.png, commonIcoTheme.png → 162 x 162 px (배수 접미사 없음, 단일 파일)
 *  - 그 외 모든 이미지 → @2x(2배수) 기준으로 제작, @3x 를 같이 넣으면 Pro/Max 에서 더 선명
 *
 * [기기 대응]
 *  아이폰 8 (@2x, 375pt) ~ 아이폰 17 Pro (@3x, 402pt) 는 모두
 *  "포인트(pt) 기준 같은 크기 + 배수만 다른 파일"로 처리된다.
 *  => 1x 논리 크기를 여기 한 곳에만 적어두고, @2x / @3x 를 자동 생성한다.
 *
 * [캐릭터 크기 기준]
 *  사용자가 보내준 아이폰 16/17 Pro 스크린샷(402pt 폭)에서 실측한 값:
 *   - 암호창 캐릭터   : 약 47 x 55 pt  → 60pt 정사각 슬롯 안에 contain
 *   - 말풍선 옆 캐릭터: 약 49 x 57 pt  → 말풍선 이미지에 포함되어 있으므로 별도 처리 X
 *   - 프로필 썸네일   : 약 40 x 40 pt  → 162px 정사각(=81pt @2x)
 *   - 탭바 아이콘     : 약 33~44 x 34~39 pt → 30pt 정사각 슬롯
 */

/** 생성할 배수 (아이폰 8 = 2x / 아이폰 X 이후 Pro = 3x) */
export const SCALES = [2, 3];

/** 배경 이미지 기준 논리 캔버스 (가장 긴 기기 기준으로 잡고 CSS 가 잘라 씀) */
export const BG_BASE = { w: 430, h: 932 };

/**
 * 캐릭터 A / B 역할
 *  A = 왼쪽 = 상대방  |  B = 오른쪽 = 나
 */
export const ROLE = { A: 'left', B: 'right' };

/**
 * 슬롯 정의
 *  name      : 최종 파일명(확장자/배수 접미사 제외)
 *  size      : 1x 논리 크기 (px)
 *  from      : 'A' | 'B' | 'deco' | 'bubble'
 *  fitRatio  : 슬롯 대비 캐릭터가 차지할 비율 (여백 확보용)
 *  round     : true 면 원형 마스크(프로필용)
 *  fixedPx   : 배수 무시하고 이 절대 픽셀로 1장만 생성 (프로필/테마아이콘)
 */
export const SLOTS = [
  /* ── 1. 암호 입력 화면 ───────────────────────────────
     카카오 iOS 는 4칸을 각각 다른 파일로 받는다.
     기본(입력 전) = passcodeImgCode0N.png        → A 캐릭터(상대방)
     선택(입력 후) = passcodeImgCode0NSelected.png → B 캐릭터(나)
     ※ 구버전/안드로이드 네이밍(passcodeMarkEmpty/Full)도 같이 넣어 호환. */
  { name: 'passcodeImgCode01', size: 60, from: 'A', fitRatio: 0.92 },
  { name: 'passcodeImgCode02', size: 60, from: 'A', fitRatio: 0.92 },
  { name: 'passcodeImgCode03', size: 60, from: 'A', fitRatio: 0.92 },
  { name: 'passcodeImgCode04', size: 60, from: 'A', fitRatio: 0.92 },
  { name: 'passcodeImgCode01Selected', size: 60, from: 'B', fitRatio: 0.92 },
  { name: 'passcodeImgCode02Selected', size: 60, from: 'B', fitRatio: 0.92 },
  { name: 'passcodeImgCode03Selected', size: 60, from: 'B', fitRatio: 0.92 },
  { name: 'passcodeImgCode04Selected', size: 60, from: 'B', fitRatio: 0.92 },
  // 하위호환 별칭
  { name: 'passcodeMarkEmpty', size: 60, from: 'A', fitRatio: 0.92 },
  { name: 'passcodeMarkFull', size: 60, from: 'B', fitRatio: 0.92 },

  /* ── 2. 기본 프로필 덮어쓰기 (162x162 절대 규격) ────── */
  { name: 'profileImg01', fixedPx: 162, from: 'B', fitRatio: 0.86, round: true },
  { name: 'profileImg02', fixedPx: 162, from: 'A', fitRatio: 0.86, round: true },
  { name: 'profileImg03', fixedPx: 162, from: 'B', fitRatio: 0.86, round: true },
  { name: 'commonIcoTheme', fixedPx: 162, from: 'B', fitRatio: 0.86 },

  /* ── 3. 하단 탭바 아이콘 (데코 벡터 5종) ───────────── */
  { name: 'maintabIcoFriends', size: 30, from: 'deco:star-blue' },
  { name: 'maintabIcoFriendsSelected', size: 30, from: 'deco:star-blue', boost: true },
  { name: 'maintabIcoChats', size: 30, from: 'deco:burst-pink' },
  { name: 'maintabIcoChatsSelected', size: 30, from: 'deco:burst-pink', boost: true },
  { name: 'maintabIcoBrowse', size: 30, from: 'deco:swirl-green' },
  { name: 'maintabIcoBrowseSelected', size: 30, from: 'deco:swirl-green', boost: true },
  { name: 'maintabIcoShopping', size: 30, from: 'deco:star-cream' },
  { name: 'maintabIcoShoppingSelected', size: 30, from: 'deco:star-cream', boost: true },
  { name: 'maintabIcoMore', size: 30, from: 'deco:burst-black' },
  { name: 'maintabIcoMoreSelected', size: 30, from: 'deco:burst-black', boost: true },
  { name: 'maintabIcoFind', size: 30, from: 'deco:swirl-green' },
  { name: 'maintabIcoFindSelected', size: 30, from: 'deco:swirl-green', boost: true },
];

/** 배경 이미지 4종 (직접 만든 별 배경 PNG 를 기기 비율에 맞게 채워 생성)
 *  ※ 배경은 @2x 만 만든다.
 *    - @3x 까지 넣으면 테마 용량이 2배 이상 커져서(1.1MB → 0.5MB) 다운로드가 불안정하다.
 *    - 흐릿한 별 패턴이라 iOS 가 @2x 를 늘려 써도 육안으로 차이가 없다. */
export const BG_SCALES = [2];

export const BG_SLOTS = [
  { name: 'mainBgImage', density: 0.55 },
  { name: 'maintabBgImage', density: 0.0, h: 90 },
  { name: 'chatroomBgImage', density: 0.75 },
  { name: 'passcodeBgImage', density: 0.35 },
];

/**
 * 말풍선
 * ─────────────────────────────────────────────────────────────
 * ★ 말풍선은 "고정 크기 이미지 1장"을 넣고, 카카오가 capInset 으로 늘려 쓴다.
 *   -ios-background-image: '파일.png' <capTop> <capLeft>;
 *   · capTop / capLeft 만큼은 절대 안 늘어남 (모서리 보존)
 *   · 아래/오른쪽은 (전체 − cap − 1px) 로 자동 대칭
 *   · 가운데 1px 만 반복되므로 → 글자가 길어져도 모서리가 안 뭉개짐
 *
 * capInset = [top, left, bottom, right] (1x pt 기준)
 * 손그림 외곽선이라 모서리 반경(약 20pt) + 선 두께 여유를 줘서 24pt 로 잡음.
 *
 * gen = public/bubbles 에 파일이 없을 때 자동 생성할 규격 (1x pt)
 */
const CAP = [24, 24, 24, 24];

/** 직접 만든 말풍선 원본 (public/bubbles/, 흰 배경 제거 완료) */
export const BUBBLE_SRC = {
  small: 'bubbles/src-small.png',   // 236 x 156
  wide: 'bubbles/src-wide.png',     // 728 x 156
  long: 'bubbles/src-long.png',     // 996 x 220
  mid: 'bubbles/src-mid.png',       // 728 x 228
};

export const BUBBLE_SLOTS = [
  { name: 'chatroomBubbleReceive01', capInset: CAP, src: 'wide' },
  { name: 'chatroomBubbleReceive01Selected', capInset: CAP, src: 'wide', dim: true },
  { name: 'chatroomBubbleReceive02', capInset: CAP, src: 'mid' },
  { name: 'chatroomBubbleReceive02Selected', capInset: CAP, src: 'mid', dim: true },
  { name: 'chatroomBubbleSend01', capInset: CAP, src: 'long' },
  { name: 'chatroomBubbleSend01Selected', capInset: CAP, src: 'long', dim: true },
  { name: 'chatroomBubbleSend02', capInset: CAP, src: 'small' },
  { name: 'chatroomBubbleSend02Selected', capInset: CAP, src: 'small', dim: true },
];

/** 테마 메타 */
export const THEME_META = {
  name: '내 캐릭터 테마',
  id: 'com.mytheme.kakaotalk.character',
  version: '9.2.5',
  author: 'kakao-theme-maker',
  url: 'https://example.com',
};
