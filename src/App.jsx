import { useRef, useState } from 'react';
import UploadSlot from './components/UploadSlot.jsx';
import { DownloadRow } from './components/DownloadRow.jsx';
import { StarBg, DecoBar } from './components/Deco.jsx';
import { buildTheme, saveTheme } from './lib/buildTheme.js';
import { isInAppBrowser, openInExternalBrowser } from './lib/viewport.js';
import { CHAR_SCALE } from './constants/themeSpec.js';
import './styles/app.css';

const FILENAME = 'mytheme.ktheme';
const INAPP = isInAppBrowser();

export default function App() {
  const [fileA, setFileA] = useState(null);   // 왼쪽 / 상대방
  const [fileB, setFileB] = useState(null);   // 오른쪽 / 나
  const [background, setBackground] = useState(null);
  const [charScale, setCharScale] = useState(1);
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState('');
  const [error, setError] = useState('');

  const ready = fileA && fileB && !busy;
  const pick = (setter) => (file) => {
    setter(file); setResult(null); setSaved(''); setError('');
  };

  const run = useRef(0);
  const timer = useRef(null);

  // 캐릭터 크기만 바꿔 다시 만들 때는 이전 결과(미리보기)를 띄워둔 채로 교체한다
  const generate = async (scale = charScale) => {
    if (!fileA || !fileB) return;
    const id = ++run.current;
    setBusy(true); setSaved(''); setError(''); setPct(0);
    try {
      const next = await buildTheme(fileA, fileB, (msg, p) => {
        if (id === run.current) { setStep(msg); setPct(Math.round(p * 100)); }
      }, { background, charScale: scale });
      if (id === run.current) setResult(next);
    } catch (e) {
      console.error(e);
      if (id === run.current) setError('생성에 실패했어요. 사진을 바꿔서 다시 시도해 주세요. ' + (e.message || ''));
    } finally { if (id === run.current) setBusy(false); }
  };

  const changeScale = (value) => {
    setCharScale(value);
    if (!result) return;                       // 아직 생성 전이면 값만 바꿔둔다
    clearTimeout(timer.current);
    timer.current = setTimeout(() => generate(value), 350);
  };

  return (
    <div className="viewport">
      <div className="stage">
        <div className="screen">
          <StarBg />

          {INAPP && (
            <div className="inapp">
              <p>카카오톡 안에서는 파일 저장이 막힐 수 있어요. Safari로 열어 주세요.</p>
              <button onClick={openInExternalBrowser}>Safari로 열기</button>
            </div>
          )}

          <h1 className="title">좋아하는 캐릭터로 심플한 카카오톡 테마를 만들어 보세요.</h1>
          <p className="subtitle">아이폰만 가능합니다.</p>

          <div className="guide">
            <ol>
              <li>테마 파일(.ktheme) 다운받기</li>
              <li>다운로드 목록에서 다운받은 파일을 카카오톡 ‘나와의 채팅방’으로 보내기</li>
              <li>채팅방에 보내진 파일을 누르고 ‘테마 적용하기’ 클릭</li>
            </ol>
          </div>

          <div className="slots">
            <UploadSlot label="왼쪽" disabled={busy} onPick={pick(setFileA)} />
            <UploadSlot label="오른쪽" disabled={busy} onPick={pick(setFileB)} />
          </div>

          <div className="background-slot">
            <UploadSlot label="배경화면" removable disabled={busy} onPick={pick(setBackground)} />
            <p>선택한 사진을 채팅방 배경으로 넣어요. 비워두면 기존 별 배경을 사용해요.</p>
          </div>

          <div className="char-size">
            <div className="char-size-head">
              <span className="slot-chip">캐릭터 크기</span>
              <b>{Math.round(charScale * 100)}%</b>
            </div>
            <input type="range" aria-label="말풍선 캐릭터 크기"
              min={CHAR_SCALE.min} max={CHAR_SCALE.max} step={CHAR_SCALE.step} value={charScale}
              onChange={(e) => changeScale(Number(e.target.value))} />
            <p>말풍선 옆 캐릭터 크기예요. 생성한 뒤에 움직이면 미리보기가 바로 바뀌어요.</p>
            {result?.preview && <div className="bubble-preview">
              <p>미리보기 (실제 아이폰 화면 크기)</p>
              {[['you', '받은 말풍선'], ['me', '보낸 말풍선']].map(([side, alt]) => (
                <img key={side} className={side} src={result.preview[side]} alt={alt}
                  onLoad={(e) => { e.currentTarget.style.width = `${e.currentTarget.naturalWidth / 3}px`; }} />
              ))}
            </div>}
          </div>

          <button className="cta" disabled={!ready} onClick={() => generate()}>
            {busy ? '만드는 중…' : '생성하기'}
          </button>

          {busy && (
            <>
              <div className="progress">{step} {pct}%</div>
              <div className="progress-bar"><i style={{ width: `${pct}%` }} /></div>
            </>
          )}

          {error && <p className="error" role="alert">{error}</p>}

          {result && !busy && (
            <>
              <DownloadRow
                filename={FILENAME}
                onDownload={async () => {
                  const how = await saveTheme(result.blob, FILENAME);
                  if (how === 'shared')
                    setSaved('공유 완료! 카카오톡 ‘나와의 채팅방’에 보낸 파일을 눌러 테마를 적용하세요.');
                  else if (how === 'downloaded')
                    setSaved('다운로드 목록에서 파일을 카카오톡 ‘나와의 채팅방’으로 보내세요.');
                }}
              />
              {saved && <p className="saved">{saved}</p>}
            </>
          )}

          <DecoBar />
        </div>
      </div>
    </div>
  );
}
