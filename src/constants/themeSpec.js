/**
 * themeSpec.js
 * ─────────────────────────────────────────────────────────────
 * ★ 실제로 작동하는 테마(동물의숲©말랑.ktheme)를 뜯어서 만든 정확한 규격 ★
 *
 * 확인된 사실
 *  1. 이미지는 전부 @3x 한 벌만 넣는다. (@2x 는 아예 없어도 정상 동작)
 *     예외: commonIcoTheme.png 만 배수 접미사 없이 162x162.
 *  2. 파일이 몇 개 빠져 있어도 테마는 정상 적용된다.
 *     (실제 작동 테마도 findBtnAddFriend.png 가 없는 채로 동작 중)
 *  3. zip 루트에 KakaoTalkTheme.css + Images/ 폴더.
 */

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

/** 배경 이미지 — 실제 테마 실측값
 *  별 패턴은 '채팅방'에만. 친구탭/채팅목록/탭바/잠금화면은 깨끗한 흰색. */
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

/* ★★ 말풍선 규격 ★★
   cap 은 좌우/상하 대칭으로 잡힌다(왼쪽 고정=오른쪽 고정=capLeft).
   지켜야 할 조건:
     (1) capLeft >= 캐릭터 폭      (2) capLeft*2 <  이미지 가로
     (3) capTop  >= 캐릭터 높이+간격 (4) capTop*2  <  이미지 세로
     (5) insets(좌+우) + 17 >= 이미지 가로   (6) insets(위+아래) + 17 >= 이미지 세로

   이미지 71 x 95pt / 캐릭터 34 x 40pt / 캐릭터~말풍선 간격 6pt
   글자 여백: 위 14 · 아래 18 · 좌우 27 (좌우는 조건(5) 때문에 더 줄일 수 없음) */
/* capTop 은 '말풍선 윗테두리보다 아래'여야 한다.
   테두리 위에 걸리면 그 검은 선이 세로로 복제돼 까만 덩어리가 된다. */
export const CELL01 = {
  w: 213, h: 285,                              // 71 x 95pt
  char: { w: 90, h: 102 },                     // 30 x 34pt
  bubble: { w: 213, h: 165, y: 120, x: 0 },    // 말풍선 71 x 55pt, 위에서 40pt
};
export const CELL02 = {
  w: 213, h: 165,                              // 71 x 55pt (캐릭터·꼬리 없음)
  char: null,
  bubble: { w: 213, h: 165, y: 0, x: 0 },
};

/* cap / insets 모두 1배수 pt.  insets = top left bottom right */
export const CELL_CSS = {
  receive01: { cap: '46px 31px', insets: '54px 27px 24px 27px' },
  send01:    { cap: '46px 31px', insets: '54px 27px 24px 27px' },
  receive02: { cap: '26px 31px', insets: '19px 27px 19px 27px' },
  send02:    { cap: '26px 31px', insets: '19px 27px 19px 27px' },
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
