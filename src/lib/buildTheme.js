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
  BUBBLE_SLOTS, BUBBLE_ART, CELL01, CELL02,
} from '../constants/themeSpec.js';
import {
  buildMaster, renderToSlot, toPngBlob, loadImage, makeCanvas,
} from './imageProcess.js';
import { loadDeco, renderBackground } from './deco.js';
import { buildThemeCss } from './cssTemplate.js';
import { renderBubbleCell } from './bubbleCell.js';

/**
 * @param {File} fileA  왼쪽 / 상대방
 * @param {File} fileB  오른쪽 / 나
 */
export async function buildTheme(fileA, fileB, rawStep = () => {}) {
  // 진행률이 뒤로 가지 않게 (누끼 라이브러리가 단계마다 0부터 다시 세서
  // 5% → 25% → 5% 처럼 튀던 문제)
  let seen = 0;
  const onStep = (msg, p) => { seen = Math.max(seen, p); rawStep(msg, seen); };
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
      w: bg.w, h: bg.h, density: bg.stars ? 1 : 0,   // 별은 채팅방에만
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

  /* ── 6. 말풍선 (캐릭터 + 말풍선 합성) ── */
  onStep('말풍선 만드는 중…', 0.85);
  {
    const arts = {};
    for (const [k, v] of Object.entries(BUBBLE_ART)) {
      arts[k] = await loadImage(import.meta.env.BASE_URL + v);
    }
    const CELLS = { CELL01, CELL02 };
    for (const b of BUBBLE_SLOTS) {
      const L = CELLS[b.cell];
      const c = renderBubbleCell({
        bubbleArt: arts[b.art],
        charImg: b.from ? masters[b.from] : null,
        side: b.side,
        L,
      });
      if (b.dim) {
        const ctx = c.getContext('2d');
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, 0, L.w, L.h);
      }
      const name = `${b.name}@3x.png`;
      images.file(name, await toPngBlob(c));
      manifest.push(`Images/${name} (${L.w}x${L.h})`);
    }
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
