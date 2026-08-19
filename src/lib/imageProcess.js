/**
 * imageProcess.js
 * ─────────────────────────────────────────────────────────────
 * 요구사항 1번: 배경 제거(누끼) + 고정 픽셀 사이즈 정규화
 *
 * 파이프라인
 *   File
 *    → removeBackground()        (@imgly, AI 누끼. 브라우저 내부에서만 동작)
 *    → killWhiteFringe()         (흰 테두리 잔여물 / 흰 배경 PNG 강제 투명화)
 *    → trimTransparent()         (투명 여백 잘라내서 "캐릭터 실제 크기" 기준 확보)
 *    → renderToSlot()            (지정된 고정 px 캔버스에 비율유지 + 중앙정렬)
 *    → toPngBlob()
 */

/* ═══════════ 0. 기본 유틸 ═══════════ */

export function makeCanvas(w, h) {
  if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}

export function loadImage(src) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => res(img);
    img.onerror = rej;
    img.src = typeof src === 'string' ? src : URL.createObjectURL(src);
  });
}

export async function toPngBlob(canvas) {
  if (canvas.convertToBlob) return canvas.convertToBlob({ type: 'image/png' });
  return new Promise((r) => canvas.toBlob(r, 'image/png'));
}

/* ═══════════ 1. AI 누끼 ═══════════ */

/**
 * @imgly/background-removal 로 배경 제거.
 * 라이브러리 로드 실패 시(오프라인 등) 원본을 그대로 넘겨서 앱이 죽지 않게 한다.
 */
export async function removeBg(file, onProgress) {
  try {
    const { removeBackground } = await import('@imgly/background-removal');
    return await removeBackground(file, {
      output: { format: 'image/png', quality: 1 },
      progress: (k, cur, total) => onProgress?.(k, cur / total),
    });
  } catch (e) {
    console.warn('[removeBg] AI 누끼 실패 → 흰배경 제거로 대체', e);
    return file;
  }
}

/* ═══════════ 2. 흰 배경 / 흰 테두리 강제 제거 ═══════════ */

/**
 * 사용자가 올린 "별 / 동글뱅이 PNG"처럼 배경이 흰색인 이미지를 투명화한다.
 * AI 누끼 후 남는 흰색 프린지 제거에도 그대로 쓴다.
 *
 * @param {number} threshold  이 값 이상으로 밝고 무채색이면 배경으로 간주 (0~255)
 * @param {number} feather    경계 부드럽게 (0~40 권장)
 */
export function killWhiteFringe(canvas, { threshold = 238, feather = 18 } = {}) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const d = img.data;

  for (let i = 0; i < d.length; i += 4) {
    if (d[i + 3] === 0) continue;
    const r = d[i], g = d[i + 1], b = d[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = max - min;          // 채도가 낮아야 "흰 배경"
    if (sat > 26) continue;         // 색이 있으면 캐릭터 → 보존

    if (min >= threshold) {
      d[i + 3] = 0;                                   // 완전 투명
    } else if (min >= threshold - feather) {
      const t = (min - (threshold - feather)) / feather;
      d[i + 3] = Math.round(d[i + 3] * (1 - t));      // 경계 페더링
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ═══════════ 3. 투명 여백 트림 ═══════════ */

/** 알파가 있는 최소 사각형을 구해 잘라낸다. (캐릭터가 슬롯 안에서 작아지는 것 방지) */
export function trimTransparent(canvas, alphaMin = 8) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const { width: w, height: h } = canvas;
  const d = ctx.getImageData(0, 0, w, h).data;

  let top = h, left = w, right = -1, bottom = -1;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > alphaMin) {
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < 0) return canvas; // 전부 투명 → 그대로

  const tw = right - left + 1;
  const th = bottom - top + 1;
  const out = makeCanvas(tw, th);
  out.getContext('2d').drawImage(canvas, left, top, tw, th, 0, 0, tw, th);
  return out;
}

/* ═══════════ 4. ★ 핵심: 고정 사이즈 슬롯 렌더 ★ ═══════════ */

/**
 * 비율을 절대 뭉개지 않고, 지정된 고정 픽셀 캔버스 정중앙에 그린다.
 *
 * @param {CanvasImageSource} src   트림까지 끝난 소스
 * @param {object} opt
 *   w, h       최종 캔버스 픽셀 (고정)
 *   fitRatio   슬롯 대비 캐릭터 최대 점유율 (0.92 = 상하좌우 4% 여백)
 *   round      true 면 원형 클리핑 (기본 프사용)
 *   bg         배경색 (null 이면 투명)
 *   boost      선택(Selected) 상태용 — 살짝 크게 + 진하게
 */
export function renderToSlot(src, opt) {
  const {
    w, h,
    fitRatio = 1,
    round = false,
    bg = null,
    boost = false,
    align = 'center',
  } = opt;

  const canvas = makeCanvas(w, h);
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  if (bg) {
    ctx.fillStyle = bg;
    if (round) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, w, h);
    }
  }

  if (round) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, Math.min(w, h) / 2, 0, Math.PI * 2);
    ctx.clip();
  }

  const sw = src.width, sh = src.height;
  const ratio = fitRatio * (boost ? 1.08 : 1);
  // ── 비율 유지 (contain) ──
  const scale = Math.min((w * ratio) / sw, (h * ratio) / sh);
  const dw = sw * scale;
  const dh = sh * scale;
  const dx = (w - dw) / 2;
  const dy =
    align === 'bottom' ? h - dh
    : align === 'top' ? 0
    : (h - dh) / 2;

  ctx.drawImage(src, dx, dy, dw, dh);
  if (round) ctx.restore();

  return canvas;
}

/* ═══════════ 5. 원스톱 파이프라인 ═══════════ */

/**
 * 업로드 File → 누끼 → 트림 까지 끝낸 "마스터 캔버스"를 만든다.
 * 슬롯마다 다시 누끼를 돌리면 느리므로, 마스터를 1회만 만들고 재사용한다.
 */
export async function buildMaster(file, onProgress) {
  const cut = await removeBg(file, onProgress);
  const img = await loadImage(cut);

  // 고해상도 유지 (최대 1024로 제한 — 메모리 보호)
  const cap = 1024;
  const s = Math.min(1, cap / Math.max(img.width, img.height));
  const base = makeCanvas(Math.round(img.width * s), Math.round(img.height * s));
  base.getContext('2d').drawImage(img, 0, 0, base.width, base.height);

  killWhiteFringe(base);
  return trimTransparent(base);
}

/**
 * 마스터 캔버스 → 특정 슬롯 규격 PNG Blob
 * @param {number} scale  1 / 2 / 3 배수
 */
export async function exportSlot(master, slot, scale = 2) {
  const base = slot.fixedPx ?? slot.size;
  const px = slot.fixedPx ? slot.fixedPx : Math.round(base * scale);
  const canvas = renderToSlot(master, {
    w: px,
    h: px,
    fitRatio: slot.fitRatio ?? 1,
    round: slot.round,
    boost: slot.boost,
  });
  return toPngBlob(canvas);
}
