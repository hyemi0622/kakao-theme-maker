/**
 * bubble.js
 * ─────────────────────────────────────────────────────────────
 * 손그림 느낌의 말풍선(흰 채움 + 짙은 외곽선)을 캔버스로 그린다.
 *
 * 왜 생성기가 필요한가:
 *  카카오 말풍선은 capInset 방식으로 "가운데 1px 만 반복"해서 늘어난다.
 *  손그림 외곽선은 그 1px 이 쭉 늘어나면 중앙부만 직선이 되어 어색하다.
 *  → 흔들림(wobble)의 파장을 capInset 바깥에만 주고, 가운데는 거의 직선으로
 *    그려서 늘어나도 자연스럽게 이어지도록 설계했다.
 *
 * public/bubbles/ 에 직접 만든 PNG 를 넣으면 그쪽이 우선 사용된다.
 */

import { makeCanvas } from './imageProcess.js';

/**
 * @param {object} o
 *  w, h        캔버스 픽셀
 *  r           모서리 반경(px)
 *  stroke      외곽선 두께(px)
 *  color       외곽선 색
 *  fill        채움 색
 *  wobble      손떨림 강도(px). 0 이면 매끈한 라운드 사각형
 *  flatMid     true 면 좌우 중앙부는 흔들림 없이 직선 (capInset 늘어남 대비)
 *  capX        좌우 고정영역(px). 이 안쪽만 흔들림을 준다.
 */
export function renderBubble({
  w, h,
  r = 44,
  stroke = 7,
  color = '#333031',
  fill = '#FFFFFF',
  wobble = 2.2,
  flatMid = true,
  capX = null,
  seed = 7,
} = {}) {
  const c = makeCanvas(w, h);
  const ctx = c.getContext('2d');
  const pad = stroke / 2 + 1;
  const x0 = pad, y0 = pad, x1 = w - pad, y1 = h - pad;
  const cap = capX ?? Math.min(w * 0.35, r * 2.2);

  let s = seed;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280) * 2 - 1;

  // 흔들림 세기: 좌우 끝(capX 안쪽)에서만 크고, 가운데는 0 으로 수렴
  const amp = (x) => {
    if (!flatMid) return wobble;
    const d = Math.min(x - x0, x1 - x);
    return d < cap ? wobble * (1 - d / cap) : 0;
  };

  const ptsTop = [], ptsBot = [];
  const N = Math.max(10, Math.round(w / 26));
  for (let i = 0; i <= N; i++) {
    const x = x0 + r + ((x1 - r - (x0 + r)) * i) / N;
    ptsTop.push([x, y0 + rnd() * amp(x)]);
    ptsBot.push([x, y1 + rnd() * amp(x)]);
  }

  const p = new Path2D();
  p.moveTo(x0 + r, y0);
  ptsTop.forEach(([x, y], i) => (i ? p.lineTo(x, y) : p.lineTo(x, y)));
  p.quadraticCurveTo(x1, y0 + rnd() * wobble, x1 + rnd() * wobble * 0.6, y0 + r);
  p.lineTo(x1 + rnd() * wobble * 0.6, y1 - r);
  p.quadraticCurveTo(x1, y1, x1 - r, y1);
  for (let i = ptsBot.length - 1; i >= 0; i--) p.lineTo(ptsBot[i][0], ptsBot[i][1]);
  p.quadraticCurveTo(x0, y1 + rnd() * wobble, x0 + rnd() * wobble * 0.6, y1 - r);
  p.lineTo(x0 + rnd() * wobble * 0.6, y0 + r);
  p.quadraticCurveTo(x0, y0, x0 + r, y0);
  p.closePath();

  ctx.fillStyle = fill;
  ctx.fill(p);
  ctx.strokeStyle = color;
  ctx.lineWidth = stroke;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.stroke(p);

  return c;
}
