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

/** 배경 이미지 — 실제 테마 실측값 */
export const BG_SLOTS = [
  { name: 'mainBgImage', w: 1125, h: 2250 },
  { name: 'chatroomBgImage', w: 1125, h: 2250 },
  { name: 'passcodeBgImage', w: 1200, h: 1200 },
  { name: 'maintabBgImage', w: 1410, h: 147, plain: true },  // 별 없이 흰 배경
];

/**
 * 말풍선 — 반드시 290 x 160 (@3x)
 * ─────────────────────────────────────────────────────────────
 * 실제 작동 테마가 이 크기 + 아래 수치를 쓰고 있어서 그대로 따른다.
 *   -ios-background-image: '파일.png' 48px 25px;
 *   -ios-title-edgeinsets: 21px 25px 13px 27px;
 * 크기 1장만 넣으면 글자 길이에 따라 카카오가 알아서 늘려준다.
 *
 * 01 = 단독/첫 메시지,  02 = 연속 메시지(group)
 */
export const BUBBLE_W = 290;
export const BUBBLE_H = 160;
export const BUBBLE_CAP = '48px 25px';
export const BUBBLE_INSETS = '21px 25px 13px 27px';

export const BUBBLE_SRC = {
  small: 'bubbles/src-small.png',
  wide: 'bubbles/src-wide.png',
  long: 'bubbles/src-long.png',
  mid: 'bubbles/src-mid.png',
};

export const BUBBLE_SLOTS = [
  { name: 'chatroomBubbleReceive01', src: 'wide' },
  { name: 'chatroomBubbleReceive01Selected', src: 'wide', dim: true },
  { name: 'chatroomBubbleReceive02', src: 'mid' },
  { name: 'chatroomBubbleReceive02Selected', src: 'mid', dim: true },
  { name: 'chatroomBubbleSend01', src: 'long' },
  { name: 'chatroomBubbleSend01Selected', src: 'long', dim: true },
  { name: 'chatroomBubbleSend02', src: 'small' },
  { name: 'chatroomBubbleSend02Selected', src: 'small', dim: true },
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
