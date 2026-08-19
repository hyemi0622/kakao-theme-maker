/**
 * bubbleCell.js
 * ─────────────────────────────────────────────────────────────
 * 캐릭터 + 말풍선을 한 장의 PNG 로 합성한다.
 *
 * 카카오톡은 메시지 배경을 이미지 1장으로만 받는다.
 * 그래서 "말풍선 옆에 캐릭터가 앉아있는" 연출은
 * 캐릭터와 말풍선을 하나의 이미지로 합쳐서 넣어야 한다.
 *
 * 늘어나는 규칙
 *   -ios-background-image: '파일.png' <capTop> <capLeft>;
 *   · 위에서 capTop 만큼, 왼쪽에서 capLeft 만큼은 고정
 *   · 그 지점의 1px 만 반복되며 늘어남
 *   → capTop / capLeft 를 '캐릭터 바깥, 말풍선 몸통 안쪽'에 두면
 *     캐릭터는 절대 안 늘어나고 말풍선만 커진다.
 *
 *  받은 메시지(왼쪽)                    보낸 메시지(오른쪽)
 *  ┌──────────────────┐               ┌──────────────────┐
 *  │ [캐릭터]         │               │         [캐릭터] │
 *  │    ┌───────────┐ │               │ ┌───────────┐    │
 *  │    │ 말풍선  ↔ │ │               │ │ ↔ 말풍선  │    │
 *  │    └───────────┘ │               │ └───────────┘    │
 *  └──────────────────┘               └──────────────────┘
 */

import { makeCanvas } from './imageProcess.js';

/** 말풍선 원본을 목표 크기로 (세로 비율유지 → 가로 9-slice) */
function fitBubbleArt(img, tw, th) {
  const f = th / img.height;
  const w2 = Math.max(1, Math.round(img.width * f));

  const mid = makeCanvas(w2, th);
  const mctx = mid.getContext('2d');
  mctx.imageSmoothingQuality = 'high';
  mctx.drawImage(img, 0, 0, w2, th);

  const c = makeCanvas(tw, th);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  const cap = Math.min(Math.round(th * 0.45), Math.floor(tw / 2) - 1, Math.floor(w2 / 2) - 1);
  if (cap <= 0 || w2 === tw) {
    ctx.drawImage(mid, 0, 0, tw, th);
    return c;
  }
  ctx.drawImage(mid, 0, 0, cap, th, 0, 0, cap, th);
  ctx.drawImage(mid, w2 - cap, 0, cap, th, tw - cap, 0, cap, th);
  ctx.drawImage(mid, cap, 0, w2 - cap * 2, th, cap, 0, tw - cap * 2, th);
  return c;
}

/**
 * 캐릭터 + 말풍선 합성
 * @param {object} o
 *   bubbleArt  말풍선 원본 Image
 *   charImg    캐릭터 마스터 캔버스 (null 이면 말풍선만)
 *   side       'left'(받은) | 'right'(보낸)
 *   L          레이아웃 (@3x 픽셀)
 */
export function renderBubbleCell({ bubbleArt, charImg, side, L }) {
  const c = makeCanvas(L.w, L.h);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  // 1) 말풍선 몸통
  const bw = L.bubble.w, bh = L.bubble.h;
  const bx = side === 'left' ? L.w - bw : 0;
  const by = L.h - bh;
  ctx.drawImage(fitBubbleArt(bubbleArt, bw, bh), bx, by);

  // 2) 캐릭터 (말풍선 위에 겹쳐서)
  if (charImg) {
    const box = L.char;                       // 정사각 박스 크기
    const sw = charImg.width, sh = charImg.height;
    const s = Math.min(box / sw, box / sh);   // 비율 유지
    const dw = sw * s, dh = sh * s;
    const dx = side === 'left' ? 0 : L.w - dw;
    const dy = 0;
    ctx.drawImage(charImg, dx, dy, dw, dh);
  }

  return c;
}
