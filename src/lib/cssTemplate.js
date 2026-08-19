/**
 * cssTemplate.js
 * ─────────────────────────────────────────────────────────────
 * KakaoTalkTheme.css 를 문자열로 생성한다.
 *
 * 문법 메모 (카카오 iOS 테마 전용 확장 속성)
 *  -ios-background-image: 'file.png' <capTop> <capLeft>;
 *      → 9-patch 와 같은 개념. 상/좌 값만큼은 "안 늘어나는 고정 영역",
 *        나머지 가운데 1px 만 반복해서 늘어난다. (1배수 pt 기준)
 *        말풍선 꼬리는 반드시 이 고정 영역 안에 들어가야 안 뭉개진다.
 *  -ios-title-edgeinsets: top left bottom right;
 *      → 말풍선 안쪽 텍스트 여백.
 *  -ios-selected-background-image / -ios-selected-text-color:
 *      → 눌린/선택 상태.
 */

import { BUBBLE_SLOTS, THEME_META } from '../constants/themeSpec.js';

const ins = (a) => a.join('px ') + 'px';

export function buildThemeCss(opt = {}) {
  const m = { ...THEME_META, ...opt.meta };
  const B = Object.fromEntries(BUBBLE_SLOTS.map((b) => [b.name, b]));
  // capInset = [top, left, bottom, right] → -ios-background-image 는 top left 두 값만 사용
  const cap = (n) => `${B[n].capInset[0]}px ${B[n].capInset[1]}px`;

  return `@charset "utf-8";

/* ==========================================================================
   ${m.name}
   kakao-theme-maker 로 자동 생성됨
   대응 기기: iPhone 8 ~ iPhone 17 Pro Max (모든 이미지 @2x / @3x 동봉)
   ========================================================================== */

-kakaotalk-theme-name: '${m.name}';
-kakaotalk-theme-id: '${m.id}';
-kakaotalk-theme-version: '${m.version}';
-kakaotalk-author-name: '${m.author}';
-kakaotalk-theme-url: '${m.url}';

/* --------------------------------------------------------------------------
   1. 공통 / 메인 배경
   -------------------------------------------------------------------------- */
MainViewStyle-Primary {
  background-color: #FFFFFF;
  -ios-background-image: 'mainBgImage.png';
  -ios-text-color: #1F1F1F;
  -ios-sub-text-color: #8A8A8E;
  -ios-separator-color: #00000010;
}

MainViewStyle-Secondary {
  background-color: #FFFFFF00;
  -ios-text-color: #303030;
  -ios-sub-text-color: #989898;
}

SectionTitleStyle-Main {
  background-color: #FFFFFF00;
  -ios-text-color: #666666;
}

HeaderStyle-Main {
  background-color: #FFFFFF00;
  -ios-text-color: #111111;
  -ios-sub-text-color: #8A8A8E;
  -ios-icon-color: #111111;
  -ios-statusbar-style: 'default';   /* 밝은 배경 → 검은 상태바 글씨 */
}

BottomBannerStyle {
  background-color: #F5F5F5;
  -ios-text-color: #303030;
  -ios-sub-text-color: #666666;
}

FeatureStyle-Primary {
  -ios-tint-color: #7B93C6;
  -ios-text-color: #FFFFFF;
}

ButtonStyle-AddFriend {
  background-color: #5B5B5B;
  -ios-text-color: #FFFFFF;
  -ios-corner-radius: 999px;
}

/* --------------------------------------------------------------------------
   2. 기본 프로필 사진 덮어쓰기  (162 x 162 px 고정, 배수 접미사 없음)
   기본 프사를 쓰는 친구 전원이 내 캐릭터로 바뀐다.
   -------------------------------------------------------------------------- */
DefaultProfileStyle {
  -ios-profile-image-01: 'profileImg01.png';
  -ios-profile-image-02: 'profileImg02.png';
  -ios-profile-image-03: 'profileImg03.png';
  -ios-background-color: #FFFFFF;
  -ios-corner-radius: 15px;
}

/* --------------------------------------------------------------------------
   3. 하단 탭바 (별 / 동글뱅이 5종)
   -------------------------------------------------------------------------- */
TabbarStyle-Main {
  background-color: #FFFFFFF2;
  -ios-background-image: 'maintabBgImage.png';
  -ios-separator-color: #00000010;

  -ios-icon-friends:            'maintabIcoFriends.png';
  -ios-selected-icon-friends:   'maintabIcoFriendsSelected.png';
  -ios-icon-chats:              'maintabIcoChats.png';
  -ios-selected-icon-chats:     'maintabIcoChatsSelected.png';
  -ios-icon-browse:             'maintabIcoBrowse.png';
  -ios-selected-icon-browse:    'maintabIcoBrowseSelected.png';
  -ios-icon-find:               'maintabIcoFind.png';
  -ios-selected-icon-find:      'maintabIcoFindSelected.png';
  -ios-icon-shopping:           'maintabIcoShopping.png';
  -ios-selected-icon-shopping:  'maintabIcoShoppingSelected.png';
  -ios-icon-more:               'maintabIcoMore.png';
  -ios-selected-icon-more:      'maintabIcoMoreSelected.png';

  -ios-text-color: #B0B0B0;
  -ios-selected-text-color: #1F1F1F;
  -ios-badge-background-color: #FF6FB1;
  -ios-badge-text-color: #FFFFFF;
}

/* --------------------------------------------------------------------------
   4. 채팅방 배경
   -------------------------------------------------------------------------- */
BackgroundStyle-ChatRoom {
  background-color: #FFFFFF;
  -ios-background-image: 'chatroomBgImage.png';
  -ios-background-content-mode: 'scaleAspectFill';  /* 기기 비율 달라도 꽉 참 */
  -ios-date-text-color: #666666;
  -ios-date-background-color: #FFFFFFCC;
}

/* --------------------------------------------------------------------------
   5. 말풍선
   ★ capInset(늘어나는 영역) 규칙 ★
     -ios-background-image: '파일.png' <capTop> <capLeft>;
     · capTop  : 위에서부터 이만큼(pt)은 절대 안 늘어남
     · capLeft : 왼쪽에서부터 이만큼(pt)은 절대 안 늘어남
     · 아래/오른쪽은 (전체 - cap - 1px) 로 자동 대칭 계산됨
     · 따라서 "꼬리"는 항상 cap 영역 안에 들어가야 한다.
       받은말풍선(왼쪽 꼬리)  → capLeft 를 꼬리폭 + 모서리R 이상으로
       보낸말풍선(오른쪽 꼬리) → 이미지를 좌우반전 없이 만들되
                                 capLeft 는 모서리R 만, 늘어남은 가운데에서 발생
   -------------------------------------------------------------------------- */
MessageCellStyle-Receive {
  -ios-background-image: 'chatroomBubbleReceive01.png' ${cap('chatroomBubbleReceive01')};
  -ios-selected-background-image: 'chatroomBubbleReceive01Selected.png' ${cap('chatroomBubbleReceive01Selected')};
  -ios-title-edgeinsets: ${ins(BUBBLE_SLOTS[0].capInset)};
  -ios-text-color: #1F1F1F;
  -ios-selected-text-color: #1F1F1F;
  -ios-link-text-color: #357AAC;
  -ios-name-text-color: #666666;
  -ios-time-text-color: #666666;
  -ios-unread-text-color: #FF6FB1;
}

MessageCellStyle-Send {
  -ios-background-image: 'chatroomBubbleSend01.png' ${cap('chatroomBubbleSend01')};
  -ios-selected-background-image: 'chatroomBubbleSend01Selected.png' ${cap('chatroomBubbleSend01Selected')};
  -ios-title-edgeinsets: ${ins(BUBBLE_SLOTS[4].capInset)};
  -ios-text-color: #1F1F1F;
  -ios-selected-text-color: #1F1F1F;
  -ios-link-text-color: #357AAC;
  -ios-time-text-color: #666666;
  -ios-unread-text-color: #FF6FB1;
}

InputBarStyle-Chat {
  background-color: #FFFFFFF2;
  -ios-text-color: #1F1F1F;
  -ios-placeholder-text-color: #989898;
  -ios-icon-color: #7B93C6;
  -ios-send-button-color: #7B93C6;
  -ios-separator-color: #00000010;
}

BackgroundStyle-DirectShareBar {
  background-color: #F5F5F5;
  -ios-text-color: #484848;
}

BackgroundStyle-MessageNotificationBar {
  background-color: #FFFFFFF2;
  -ios-text-color: #1F1F1F;
}

/* --------------------------------------------------------------------------
   6. 암호 입력 화면
   요구사항 3번:
     · 입력 전 4칸 = A 이미지(왼쪽 / 상대방 캐릭터)
     · 한 자리 누를 때마다 그 칸이 B 이미지(오른쪽 / 내 캐릭터)로 교체
   → 카카오 iOS 는 칸마다 normal / Selected 를 따로 받으므로
     normal 에 A, Selected 에 B 를 넣으면 그대로 구현된다.
   -------------------------------------------------------------------------- */
BackgroundStyle-Passcode {
  background-color: #FFFFFF;
  -ios-background-image: 'passcodeBgImage.png';
  -ios-background-content-mode: 'scaleAspectFill';
  -ios-title-text-color: #242424;
  -ios-sub-text-color: #7F7F7F;
}

PasscodeStyle {
  /* 입력 전 (빈 칸) → A 캐릭터 */
  -ios-code-image-01: 'passcodeImgCode01.png';
  -ios-code-image-02: 'passcodeImgCode02.png';
  -ios-code-image-03: 'passcodeImgCode03.png';
  -ios-code-image-04: 'passcodeImgCode04.png';

  /* 입력 후 (채워진 칸) → B 캐릭터 */
  -ios-selected-code-image-01: 'passcodeImgCode01Selected.png';
  -ios-selected-code-image-02: 'passcodeImgCode02Selected.png';
  -ios-selected-code-image-03: 'passcodeImgCode03Selected.png';
  -ios-selected-code-image-04: 'passcodeImgCode04Selected.png';

  /* 구버전 호환 별칭 (무시되어도 무해) */
  -ios-mark-empty-image: 'passcodeMarkEmpty.png';
  -ios-mark-full-image: 'passcodeMarkFull.png';

  -ios-keypad-text-color: #111111;
  -ios-keypad-pressed-image: 'passcodeKeypadPressed.png';
  -ios-text-color: #242424;
  -ios-cancel-text-color: #111111;
}
`;
}
