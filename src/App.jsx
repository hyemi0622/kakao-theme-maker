import { useState } from 'react';
import UploadSlot from './components/UploadSlot.jsx';
import { DownloadRow } from './components/DownloadRow.jsx';
import { StarBg, DecoBar } from './components/Deco.jsx';
import { buildTheme, saveTheme } from './lib/buildTheme.js';
import { isInAppBrowser, openInExternalBrowser } from './lib/viewport.js';
import './styles/app.css';

const FILENAME = 'mytheme.ktheme';
const INAPP = isInAppBrowser();

export default function App() {
  const [fileA, setFileA] = useState(null);   // 왼쪽 / 상대방
  const [fileB, setFileB] = useState(null);   // 오른쪽 / 나
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState('');
  const [pct, setPct] = useState(0);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState('');

  const ready = fileA && fileB && !busy;

  const generate = async () => {
    if (!ready) return;
    setBusy(true);
    setResult(null);
    try {
      const { blob } = await buildTheme(fileA, fileB, (msg, p) => {
        setStep(msg);
        setPct(Math.round(p * 100));
      });
      setResult({ blob });
    } catch (e) {
      console.error(e);
      alert('생성에 실패했어요. 사진을 바꿔서 다시 시도해 주세요.\n' + e.message);
    } finally {
      setBusy(false);
    }
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
            <UploadSlot label="왼쪽" onPick={setFileA} />
            <UploadSlot label="오른쪽" onPick={setFileB} />
          </div>

          <button className="cta" disabled={!ready} onClick={generate}>
            {busy ? '만드는 중…' : '생성하기'}
          </button>

          {busy && (
            <>
              <div className="progress">{step} {pct}%</div>
              <div className="progress-bar"><i style={{ width: `${pct}%` }} /></div>
            </>
          )}

          {result && (
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
