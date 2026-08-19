/**
 * buildTheme.js
 * ─────────────────────────────────────────────────────────────
 * 업로드 2장 → 모든 에셋 생성 → JSZip → .ktheme Blob
 *
 * 구조는 실제로 작동하는 테마와 동일하게 맞췄다.
 *   mytheme.ktheme (zip)
 *   ├── KakaoTalkTheme.css
 *   └── Images/
 *        ├── ...@3x.png      (전부 @3x 한 벌)
 *        └── commonIcoTheme.png (162x162, 접미사 없음)
 */

import JSZip from 'jszip';
import {
  SLOTS, FLAT_SLOTS, BG_SLOTS, KEYPAD,
  BUBBLE_SLOTS, BUBBLE_SRC, BUBBLE_W, BUBBLE_H,
} from '../constants/themeSpec.js';
import {
  buildMaster, renderToSlot, toPngBlob, loadImage, makeCanvas,
} from './imageProcess.js';
import { loadDeco, renderBackground } from './deco.js';
import { buildThemeCss } from './cssTemplate.js';

/**
 * 9-slice 리사이즈
 * 모서리는 원본 그대로 두고 가운데만 늘이거나 줄인다.
 * → 손그림 말풍선을 290x160 규격에 맞춰도 모서리가 안 뭉개진다.
 */
function nineSlice(img, tw, th, capX = 0.28, capY = 0.42) {
  const sw = img.width, sh = img.height;
  // 먼저 높이를 맞추는 배율
  const f = th / sh;
  const cw = Math.min(Math.floor(sw * capX), Math.floor(tw / 2) - 1); // 소스 모서리 폭
  const tcw = Math.min(Math.round(cw * f), Math.floor(tw / 2) - 1);   // 타깃 모서리 폭
  const ch = Math.floor(sh * capY);
  const tch = Math.min(Math.round(ch * f), Math.floor(th / 2) - 1);

  const c = makeCanvas(tw, th);
  const ctx = c.getContext('2d');
  ctx.imageSmoothingQuality = 'high';

  const sxs = [0, cw, sw - cw, sw];
  const txs = [0, tcw, tw - tcw, tw];
  const sys = [0, ch, sh - ch, sh];
  const tys = [0, tch, th - tch, th];

  for (let r = 0; r < 3; r++) {
    for (let col = 0; col < 3; col++) {
      const sx = sxs[col], sW = sxs[col + 1] - sx;
      const sy = sys[r], sH = sys[r + 1] - sy;
      const dx = txs[col], dW = txs[col + 1] - dx;
      const dy = tys[r], dH = tys[r + 1] - dy;
      if (sW <= 0 || sH <= 0 || dW <= 0 || dH <= 0) continue;
      ctx.drawImage(img, sx, sy, sW, sH, dx, dy, dW, dH);
    }
  }
  return c;
}

/**
 * @param {File} fileA  왼쪽 / 상대방
 * @param {File} fileB  오른쪽 / 나
 */
export async function buildTheme(fileA, fileB, onStep = () => {}) {
  const zip = new JSZip();
  const images = zip.folder('Images');
  const manifest = [];

  /* ── 1. 누끼 ── */
  onStep('왼쪽 캐릭터 배경 제거 중…', 0.05);
  const masterA = await buildMaster(fileA, (_, p) => onStep('왼쪽 캐릭터 배경 제거 중…', 0.05 + p * 0.2));
  onStep('오른쪽 캐릭터 배경 제거 중…', 0.28);
  const masterB = await buildMaster(fileB, (_, p) => onStep('오른쪽 캐릭터 배경 제거 중…', 0.28 + p * 0.2));
  const masters = { A: masterA, B: masterB };

  const pickSrc = async (from) =>
    from.startsWith('deco:') ? loadDeco(from.slice(5)) : masters[from];

  /* ── 2. 캐릭터 / 데코 슬롯 (전부 @3x) ── */
  onStep('테마 이미지 생성 중…', 0.5);
  for (const s of SLOTS) {
    const canvas = renderToSlot(await pickSrc(s.from), {
      w: s.px, h: s.px, fitRatio: s.fit ?? 0.94, round: s.round,
    });
    const name = `${s.name}@3x.png`;
    images.file(name, await toPngBlob(canvas));
    manifest.push(`Images/${name} (${s.px}x${s.px})`);
  }

  /* ── 3. 배수 접미사 없는 파일 ── */
  for (const s of FLAT_SLOTS) {
    const canvas = renderToSlot(await pickSrc(s.from), {
      w: s.px, h: s.px, fitRatio: s.fit ?? 0.94, round: s.round,
    });
    images.file(`${s.name}.png`, await toPngBlob(canvas));
    manifest.push(`Images/${s.name}.png (${s.px}x${s.px})`);
  }

  /* ── 4. 배경 ── */
  onStep('배경 생성 중…', 0.7);
  for (const bg of BG_SLOTS) {
    const canvas = await renderBackground({
      w: bg.w, h: bg.h, density: bg.plain ? 0 : 1,
    });
    const name = `${bg.name}@3x.png`;
    images.file(name, await toPngBlob(canvas));
    manifest.push(`Images/${name} (${bg.w}x${bg.h})`);
  }

  /* ── 5. 키패드 눌림 효과 ── */
  {
    const c = makeCanvas(KEYPAD.px, KEYPAD.px);
    const ctx = c.getContext('2d');
    ctx.fillStyle = 'rgba(0,0,0,0.06)';
    ctx.beginPath();
    ctx.arc(KEYPAD.px / 2, KEYPAD.px / 2, KEYPAD.px / 2, 0, Math.PI * 2);
    ctx.fill();
    images.file(`${KEYPAD.name}@3x.png`, await toPngBlob(c));
    manifest.push(`Images/${KEYPAD.name}@3x.png`);
  }

  /* ── 6. 말풍선 (반드시 290x160) ── */
  onStep('말풍선 넣는 중…', 0.85);
  for (const b of BUBBLE_SLOTS) {
    const img = await loadImage(import.meta.env.BASE_URL + BUBBLE_SRC[b.src]);
    const c = nineSlice(img, BUBBLE_W, BUBBLE_H);
    if (b.dim) {
      const ctx = c.getContext('2d');
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(0,0,0,0.06)';
      ctx.fillRect(0, 0, BUBBLE_W, BUBBLE_H);
    }
    const name = `${b.name}@3x.png`;
    images.file(name, await toPngBlob(c));
    manifest.push(`Images/${name} (${BUBBLE_W}x${BUBBLE_H})`);
  }

  /* ── 7. CSS ── */
  onStep('CSS 작성 중…', 0.92);
  zip.file('KakaoTalkTheme.css', buildThemeCss());
  manifest.unshift('KakaoTalkTheme.css');

  /* ── 8. 패킹 ──
     MIME 이 application/zip 이면 iOS 가 확장자를 .zip 으로 바꿔버린다. */
  onStep('압축 중…', 0.96);
  const buf = await zip.generateAsync(
    { type: 'arraybuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => onStep('압축 중…', 0.96 + (meta.percent / 100) * 0.04),
  );
  const blob = new Blob([buf], { type: 'application/octet-stream' });

  onStep('완료!', 1);
  return { blob, manifest };
}

/* ══════════════════════════════════════════════════════════
   파일 저장
   iOS Safari 의 blob: 다운로드는 100% 에서 멈추는 버그가 있어서
   공유 시트(Web Share)를 1순위로 쓴다. 어차피 목적지가 카카오톡이다.
   ══════════════════════════════════════════════════════════ */

const OCTET = 'application/octet-stream';

export async function saveTheme(blob, filename = 'mytheme.ktheme') {
  const file = new File([blob], filename, { type: OCTET });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';
      console.warn('[share] 실패 → 다운로드로 폴백', e);
    }
  }
  downloadBlob(blob, filename);
  return 'downloaded';
}

export function downloadBlob(blob, filename = 'mytheme.ktheme') {
  const safe = blob.type === OCTET ? blob : new Blob([blob], { type: OCTET });
  const url = URL.createObjectURL(safe);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  // revokeObjectURL 을 부르면 iOS 다운로드가 100% 에서 멈춘다 → 부르지 않는다.
  setTimeout(() => a.remove(), 1000);
}
