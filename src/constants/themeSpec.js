/**
 * themeSpec.js
 * ─────────────────────────────────────────────────────────────

/** 실제 테마는 @3x 만 넣는다 */
export const SCALE_SUFFIX = '@3x';

/**
 * 슬롯 정의 — 실제 작동 테마에서 실측한 픽셀 그대로
 *  from: 'A'(왼쪽/상대방) | 'B'(오른쪽/나) | 'deco:종류'
 */
export const SLOTS = [
  /* 암호 입력 화면 — 132x132
     입력 전 = A(상대방), 입력 후(Selected) = B(나) */
  { name: 'passcodeImgCode01', px: 132, from: 'A', fit: 0.94 },
  { name: 'passcodeImgCode02', px: 132, from: 'A', fit: 0.94 },
  { name: 'passcodeImgCode03', px: 132, from: 'A', fit: 0.94 },
  { name: 'passcodeImgCode04', px: 132, from: 'A', fit: 0.94 },
  { name: 'passcodeImgCode01Selected', px: 132, from: 'B', fit: 0.94 },
  { name: 'passcodeImgCode02Selected', px: 132, from: 'B', fit: 0.94 },
  { name: 'passcodeImgCode03Selected', px: 132, from: 'B', fit: 0.94 },
  { name: 'passcodeImgCode04Selected', px: 132, from: 'B', fit: 0.94 },

  /* 기본 프로필 덮어쓰기 — 360x360 @3x */
  { name: 'profileImg01', px: 360, from: 'B', fit: 0.74, bg: '#FFFFFF' },
  { name: 'profileImg02', px: 360, from: 'A', fit: 0.74, bg: '#FFFFFF' },
  { name: 'profileImg03', px: 360, from: 'B', fit: 0.74, bg: '#FFFFFF' },

  /* 하단 탭바 아이콘 — 114x114 @3x */
  { name: 'maintabIcoFriends', px: 114, from: 'deco:star-blue', fit: 0.72 },
  { name: 'maintabIcoFriendsSelected', px: 114, from: 'deco:star-blue', fit: 0.86 },
  { name: 'maintabIcoChats', px: 114, from: 'deco:burst-pink', fit: 0.72 },
  { name: 'maintabIcoChatsSelected', px: 114, from: 'deco:burst-pink', fit: 0.86 },
  { name: 'maintabIcoNow', px: 114, from: 'deco:swirl-green', fit: 0.72 },
  { name: 'maintabIcoNowSelected', px: 114, from: 'deco:swirl-green', fit: 0.86 },
  { name: 'maintabIcoShopping', px: 114, from: 'deco:star-cream', fit: 0.72 },
  { name: 'maintabIcoShoppingSelected', px: 114, from: 'deco:star-cream', fit: 0.86 },
  { name: 'maintabIcoCall', px: 114, from: 'deco:leek', fit: 0.72 },
  { name: 'maintabIcoCallSelected', px: 114, from: 'deco:leek', fit: 0.86 },
  { name: 'maintabIcoMore', px: 114, from: 'deco:burst-black', fit: 0.72 },
  { name: 'maintabIcoMoreSelected', px: 114, from: 'deco:burst-black', fit: 0.86 },
];

/** 배수 접미사 없이 딱 1장만 들어가는 파일 */
export const FLAT_SLOTS = [
  { name: 'commonIcoTheme', px: 162, from: 'B', fit: 0.86 },
];

/** 배경 이미지 — 실제 테마 실측값 **/
export const BG_SLOTS = [
  { name: 'chatroomBgImage', w: 1125, h: 2250, stars: true },
  { name: 'mainBgImage', w: 1125, h: 2250 },
  { name: 'passcodeBgImage', w: 1200, h: 1200 },
  { name: 'maintabBgImage', w: 1410, h: 147 },
];

/**
 * 말풍선 셀 (캐릭터 + 말풍선 합성)
 * ─────────────────────────────────────────────────────────────
 * 모든 수치는 @3x 픽셀. (1배수 pt = ÷3)
 *
 * 01 = 첫 메시지 → 캐릭터 포함
 * 02 = 연속 메시지 → 말풍선만 (캐릭터 없이 같은 위치에 정렬)
 *
 * capTop / capLeft 는 '캐릭터 밖 + 말풍선 몸통 안' 지점이어야
 * 캐릭터가 안 늘어나고 말풍선만 커진다.  단위는 1배수 pt.
 */

export const CELL01 = {
  w: 248, h: 247,
  char: { w: 118, h: 138 },                   // 39 x 46pt
  charPad: 18,                                // 화면 가장자리와 캐릭터 사이 여백 (@3x px)
  bubble: { w: 128, h: 130, y: 117, x: 120 }, // 말풍선 43 x 43pt
};
export const CELL02 = {
  w: 248, h: 113,
  char: null,
  bubble: { w: 128, h: 113, y: 0, x: 120 },   // 01 과 같은 x 오프셋 → 정렬 일치
};

/* ★ 두 숫자의 순서는 (capLeft, capTop) 이다. (capTop, capLeft) 가 아니다! ★
     20 = 왼쪽 고정(말풍선 안), 60 = 위쪽 고정(캐릭터 전체를 덮음)
   순서를 반대로 넣으면 늘어나는 기준선이 캐릭터를 관통해서
   답장처럼 큰 말풍선에서 캐릭터가 늘어난다.

   오른쪽 고정 = 전체가로 - capLeft - 1,  아래쪽 고정 = 전체세로 - capTop - 1
   이미지 82.7 x 82.3pt, 캐릭터 39 x 46pt, 말풍선 x 40~82.7 / y 39~82.3pt */
export const CELL_CSS = {
  //            capLeft  capTop        top  left  bottom right
  receive01: { cap: '50px 47px', insets: '50px 56px 11px 12px' },  // 꼬리(왼쪽) 여백 ↑
  send01:    { cap: '20px 47px', insets: '50px 12px 11px 56px' },  // 꼬리(오른쪽) 여백 ↑
  receive02: { cap: '50px 18px', insets: '9px 50px 9px 12px' },
  send02:    { cap: '15px 18px', insets: '9px 12px 9px 50px' },
};

/** 말풍선 원본 (public/bubbles/, 투명 배경 그대로) */
export const BUBBLE_ART = {
  tailLeft: 'bubbles/tail-left.png',    // 꼬리 왼쪽 위 → 받은 메시지 첫 줄
  tailRight: 'bubbles/tail-right.png',  // 꼬리 오른쪽 위 → 보낸 메시지 첫 줄
  plainA: 'bubbles/plain-a.png',        // 꼬리 없음 → 연속 메시지
  plainB: 'bubbles/plain-b.png',
};

/**
 * 8장 정의
 *  01 = 다른 시간대 첫 메시지 → 꼬리 O + 캐릭터 O
 *  02 = 같은 시간 연달아 보낸 메시지 → 꼬리 X + 캐릭터 X
 */
export const BUBBLE_SLOTS = [
  { name: 'chatroomBubbleReceive01', side: 'left', from: 'A', cell: 'CELL01', art: 'tailLeft' },
  { name: 'chatroomBubbleReceive01Selected', side: 'left', from: 'A', cell: 'CELL01', art: 'tailLeft', dim: true },
  { name: 'chatroomBubbleReceive02', side: 'left', from: null, cell: 'CELL02', art: 'plainA' },
  { name: 'chatroomBubbleReceive02Selected', side: 'left', from: null, cell: 'CELL02', art: 'plainA', dim: true },
  { name: 'chatroomBubbleSend01', side: 'right', from: 'B', cell: 'CELL01', art: 'tailRight' },
  { name: 'chatroomBubbleSend01Selected', side: 'right', from: 'B', cell: 'CELL01', art: 'tailRight', dim: true },
  { name: 'chatroomBubbleSend02', side: 'right', from: null, cell: 'CELL02', art: 'plainB' },
  { name: 'chatroomBubbleSend02Selected', side: 'right', from: null, cell: 'CELL02', art: 'plainB', dim: true },
];

/** 키패드 눌림 효과 */
export const KEYPAD = { name: 'passcodeKeypadPressed', px: 180 };

/** 테마 메타 (ManifestStyle 블록에 들어간다) */
export const THEME_META = {
  name: '내 캐릭터 테마',
  version: '1.0',
  author: 'kakao-theme-maker',
  url: 'https://github.com',
  id: 'com.kakao.talk.theme.mycharacter',
};

/** 색상 팔레트 */
export const COLORS = {
  bg: '#FFFFFF',
  text: '#222222',
  sub: '#666666',
  accent: '#7B93C6',
};
