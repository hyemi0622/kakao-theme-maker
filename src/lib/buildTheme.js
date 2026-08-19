/**
 * buildTheme.js
 * ─────────────────────────────────────────────────────────────
 * 업로드 2장 → 모든 에셋 생성 → JSZip → .ktheme Blob
 * 백엔드 없음. 전부 브라우저 안에서 끝난다.
 */

import JSZip from 'jszip';
import {
  SCALES, BG_SCALES, SLOTS, BG_SLOTS, BG_BASE, BUBBLE_SLOTS, BUBBLE_SRC,
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
    for (const scale of BG_SCALES) {
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

/* ══════════════════════════════════════════════════════════
   파일 저장
   ══════════════════════════════════════════════════════════
   iOS Safari 의 blob: 다운로드는 "1.4MB / 1.4MB" 에서 멈춘 채
   완료 처리가 안 되는 고질적인 버그가 있다.
   (다운로드 매니저가 blob 스트림의 끝을 인식 못 함)

   → 그래서 iOS 에서는 '공유 시트(Web Share API)' 를 1순위로 쓴다.
     어차피 최종 목적지가 카카오톡 '나와의 채팅방' 이므로
     공유 시트에서 카카오톡을 바로 고르는 게 단계도 더 짧다.
   → 공유가 안 되는 환경에서만 기존 다운로드 방식으로 폴백한다.
*/

const OCTET = 'application/octet-stream';

function asFile(blob, filename) {
  return new File([blob], filename, { type: OCTET });
}

/**
 * 저장/공유. 클릭 핸들러에서 곧바로 호출해야 한다(사용자 제스처 필요).
 * @returns {Promise<'shared'|'cancelled'|'downloaded'>}
 */
export async function saveTheme(blob, filename = 'mytheme.ktheme') {
  const file = asFile(blob, filename);

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] });
      return 'shared';
    } catch (e) {
      if (e?.name === 'AbortError') return 'cancelled';  // 사용자가 닫음
      console.warn('[share] 실패 → 다운로드로 폴백', e);
    }
  }

  downloadBlob(blob, filename);
  return 'downloaded';
}

/** 공유가 불가능할 때의 폴백 다운로드 */
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

  // ★ revokeObjectURL 을 호출하지 않는다.
  //   iOS 는 다운로드가 끝난 뒤에도 blob 을 늦게 읽어서,
  //   여기서 해제해 버리면 진행률이 100% 에서 멈춘 채 완료되지 않는다.
  //   (페이지를 벗어나면 어차피 자동 해제된다)
  setTimeout(() => a.remove(), 1000);
}
