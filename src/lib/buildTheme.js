/**
 * buildTheme.js
 * ─────────────────────────────────────────────────────────────
 * 업로드 2장 → 모든 에셋 생성 → JSZip → .ktheme Blob
 * 백엔드 없음. 전부 브라우저 안에서 끝난다.
 */

import JSZip from 'jszip';
import {
  SCALES, SLOTS, BG_SLOTS, BG_BASE, BUBBLE_SLOTS, BUBBLE_SRC,
} from '../constants/themeSpec.js';
import {
  buildMaster, renderToSlot, toPngBlob, loadImage,
  makeCanvas,
} from './imageProcess.js';
import { loadDeco, renderBackground } from './deco.js';
import { buildThemeCss } from './cssTemplate.js';

/** 파일명에 배수 접미사 붙이기 */
const named = (base, scale) => (scale === 1 ? `${base}.png` : `${base}@${scale}x.png`);

/**
 * @param {File} fileA  왼쪽 / 상대방
 * @param {File} fileB  오른쪽 / 나
 * @param {(msg:string, pct:number)=>void} onStep
 * @returns {Promise<{blob: Blob, manifest: string[]}>}
 */
export async function buildTheme(fileA, fileB, onStep = () => {}) {
  const zip = new JSZip();
  const images = zip.folder('Images');
  const manifest = [];

  /* ── 1. 누끼 (가장 오래 걸리는 단계) ── */
  onStep('왼쪽 캐릭터 배경 제거 중…', 0.05);
  const masterA = await buildMaster(fileA, (_, p) => onStep('왼쪽 캐릭터 배경 제거 중…', 0.05 + p * 0.2));

  onStep('오른쪽 캐릭터 배경 제거 중…', 0.28);
  const masterB = await buildMaster(fileB, (_, p) => onStep('오른쪽 캐릭터 배경 제거 중…', 0.28 + p * 0.2));

  const masters = { A: masterA, B: masterB };

  /* ── 2. 캐릭터 / 데코 슬롯 ── */
  onStep('테마 이미지 생성 중…', 0.5);
  for (const slot of SLOTS) {
    const scales = slot.fixedPx ? [1] : SCALES;

    for (const scale of scales) {
      const px = slot.fixedPx ?? Math.round(slot.size * scale);
      let src;

      if (slot.from === 'A' || slot.from === 'B') {
        src = masters[slot.from];
      } else if (slot.from.startsWith('deco:')) {
        src = await loadDeco(slot.from.slice(5));   // 직접 만든 PNG
      }

      const canvas = renderToSlot(src, {
        w: px,
        h: px,
        fitRatio: slot.fitRatio ?? 0.94,
        round: slot.round,
        boost: slot.boost,
      });
      const name = slot.fixedPx ? `${slot.name}.png` : named(slot.name, scale);
      images.file(name, await toPngBlob(canvas));
      manifest.push(`Images/${name}  (${px}x${px})`);
    }
  }

  /* ── 3. 배경 이미지 (별밭) ── */
  onStep('배경 생성 중…', 0.72);
  for (const bg of BG_SLOTS) {
    for (const scale of SCALES) {
      const w = Math.round(BG_BASE.w * scale);
      const h = Math.round((bg.h ?? BG_BASE.h) * scale);
      const canvas = await renderBackground({ w, h, density: bg.density });
      const name = named(bg.name, scale);
      images.file(name, await toPngBlob(canvas));
      manifest.push(`Images/${name}  (${w}x${h})`);
    }
  }

  /* ── 4. 키패드 눌림 효과 (투명 1px) ── */
  {
    const c = makeCanvas(2, 2);
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#00000010';
    ctx.fillRect(0, 0, 2, 2);
    images.file('passcodeKeypadPressed@2x.png', await toPngBlob(c));
    manifest.push('Images/passcodeKeypadPressed@2x.png');
  }

  /* ── 5. 말풍선 ──
     말풍선
     직접 만든 말풍선 PNG(public/bubbles/src-*.png)를 배수별로 리사이즈해서 넣는다.
     ※ 크기는 고정 1장이면 충분하다. 글자가 길어지면 카카오가
        capInset(CSS 의 두 숫자) 기준으로 가운데를 늘려 준다. */
  onStep('말풍선 넣는 중…', 0.85);
  for (const b of BUBBLE_SLOTS) {
    const img = await loadImage(import.meta.env.BASE_URL + BUBBLE_SRC[b.src]);
    // 원본은 @3x 기준으로 그려진 크기 → @2x 는 2/3 로 축소
    for (const scale of SCALES) {
      const k = scale / 3;
      const w = Math.max(1, Math.round(img.width * k));
      const h = Math.max(1, Math.round(img.height * k));
      const c = makeCanvas(w, h);
      const ctx = c.getContext('2d');
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, w, h);
      if (b.dim) {                       // 길게 눌렀을 때 살짝 어둡게
        ctx.globalCompositeOperation = 'source-atop';
        ctx.fillStyle = 'rgba(0,0,0,0.06)';
        ctx.fillRect(0, 0, w, h);
      }
      const name = named(b.name, scale);
      images.file(name, await toPngBlob(c));
      manifest.push(`Images/${name}  (${w}x${h})`);
    }
  }

  /* ── 6. CSS ── */
  onStep('CSS 작성 중…', 0.92);
  zip.file('KakaoTalkTheme.css', buildThemeCss());
  manifest.unshift('KakaoTalkTheme.css');

  /* ── 7. 패킹 (.ktheme = 확장자만 바꾼 zip) ──
     ★ MIME 이 'application/zip' 이면 iOS Safari 가 파일명을 멋대로
       .zip 으로 바꿔버린다. octet-stream 으로 내보내야
       download 속성의 'mytheme.ktheme' 이 그대로 저장된다. */
  onStep('압축 중…', 0.96);
  const buf = await zip.generateAsync(
    { type: 'arraybuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } },
    (meta) => onStep('압축 중…', 0.96 + (meta.percent / 100) * 0.04),
  );
  const blob = new Blob([buf], { type: 'application/octet-stream' });

  onStep('완료!', 1);
  return { blob, manifest };
}

/**
 * 브라우저 다운로드 트리거
 * iOS Safari 는 blob: URL + download 속성 조합에서
 *  · MIME 이 알려진 타입(zip 등)이면 확장자를 그쪽으로 바꿔버리고
 *  · 사용자 탭(제스처) 직후가 아니면 무시한다.
 * → octet-stream Blob + 클릭 핸들러 안에서 즉시 호출.
 */
export function downloadBlob(blob, filename = 'mytheme.ktheme') {
  // 혹시 다른 타입으로 들어와도 여기서 한 번 더 보정
  const safe =
    blob.type === 'application/octet-stream'
      ? blob
      : new Blob([blob], { type: 'application/octet-stream' });

  const url = URL.createObjectURL(safe);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;          // ← 이 이름 그대로 저장돼야 함
  a.rel = 'noopener';
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    a.remove();
    URL.revokeObjectURL(url);
  }, 4000);                        // iOS 는 늦게 읽으므로 넉넉히
}
