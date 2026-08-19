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
  { name: 'profileImg01', px: 360, from: 'B', fit: 0.84, round: true },
  { name: 'profileImg02', px: 360, from: 'A', fit: 0.84, round: true },
  { name: 'profileImg03', px: 360, from: 'B', fit: 0.84, round: true },

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

/* ★ 실제 작동 테마(동물의숲)의 규격을 그대로 따른다 ★
   이미지 290x160 @3x, cap '48px 25px', insets '21px 25px 13px 27px'
   → cap 은 1배수 pt, insets 도 1배수 pt.
   그 테마는 말풍선 위쪽에 장식(YOU♥ 태그)을 얹고 capTop 을 크게 잡아
   장식이 안 늘어나게 했다. 캐릭터도 똑같은 자리에 놓는다. */
export const CELL01 = {
  w: 290, h: 160,                              // @3x (96.7 x 53.3pt)
  char: 100,                                   // 캐릭터 박스 33pt
  bubble: { w: 206, h: 70, y: 90, x: 84 },     // 말풍선 68.7 x 23.3pt
};
export const CELL02 = {
  w: 290, h: 70,
  char: 0,
  bubble: { w: 206, h: 70, y: 0, x: 84 },
};

/* cap / insets 모두 1배수 pt.  insets = top left bottom right */
export const CELL_CSS = {
  receive01: { cap: '48px 45px', insets: '34px 34px 6px 8px' },
  send01:    { cap: '48px 8px',  insets: '34px 8px 6px 34px' },
  receive02: { cap: '17px 45px', insets: '5px 34px 5px 8px' },
  send02:    { cap: '17px 8px',  insets: '5px 8px 5px 34px' },
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
