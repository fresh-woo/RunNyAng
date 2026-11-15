import { FormEvent, useEffect, useRef, useState } from 'react';
import kitUrl from '../../../assets/images/shop-dex/shop_dex_kit.png';
import { drawStreetBuildingPreview } from '../../../entities/stage/ui/drawStreetBuildings';
import { SHOP_DEX_ENTRIES, readShopDex, saveShopDex, isShopDexAnswer, getShopLetterCount } from '../../../entities/shop-dex/model/shopDex';
import './ShopDex.css';

export const ShopDex = ({ onClose }: { onClose: () => void }) => {
  const [selectedId, setSelectedId] = useState(SHOP_DEX_ENTRIES[0].id);
  const [solvedIds, setSolvedIds] = useState(readShopDex);
  const [parts, setParts] = useState<string[]>(['']);
  const [feedback, setFeedback] = useState('');
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const entry = SHOP_DEX_ENTRIES.find((item) => item.id === selectedId)!;
  const solved = solvedIds.includes(entry.id);
  const nameParts = entry.name.split('&');

  useEffect(() => {
    if (solved) closeRef.current?.focus();
    else inputRef.current?.focus();
  }, [selectedId, solved]);

  useEffect(() => {
    const ctx = previewRef.current?.getContext('2d');
    if (ctx) drawStreetBuildingPreview(ctx, entry, solved);
  }, [entry, solved]);

  const selectEntry = (id: string) => {
    const nextEntry = SHOP_DEX_ENTRIES.find((item) => item.id === id)!;
    setSelectedId(id);
    setParts(nextEntry.name.split('&').map(() => ''));
    setFeedback('');
  };

  const submitAnswer = (event: FormEvent) => {
    event.preventDefault();
    if (!isShopDexAnswer(entry, parts)) {
      setFeedback('이름이 일치하지 않아요. 간판의 글자와 띄어쓰기를 다시 확인해 주세요.');
      return;
    }
    const updated = [...new Set([...solvedIds, entry.id])];
    setSolvedIds(updated);
    setStorageUnavailable(!saveShopDex(updated));
    setFeedback(`${entry.name}, 도감 등록 완료!`);
  };

  return (
    <div className="shop-dex-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shop-dex-title"
        className="shop-dex"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          // 도감을 읽거나 입력할 때 홈 화면의 게임 시작 단축키로 전달하지 않는다.
          event.stopPropagation();
          const editing = event.target instanceof HTMLInputElement;
          if (event.code === 'Escape' || (event.code === 'KeyB' && !editing)) {
            event.preventDefault();
            onClose();
          }
          if (event.key === 'Tab') {
            const controls = dialogRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled)');
            if (!controls?.length) return;
            const first = controls[0];
            const last = controls[controls.length - 1];
            if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
            else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
          }
        }}
      >
        <header className="shop-dex-header">
          <div><h2 id="shop-dex-title">가게 도감</h2><p>간판을 기억하고, 이름을 맞혀 도감을 채워 보세요.</p></div>
          <button ref={closeRef} type="button" onClick={onClose}>닫기 <span className="dex-key">ESC / B</span></button>
        </header>
        <div className="dex-device">
          <svg className="dex-device-skin" viewBox="302 122 687 511" preserveAspectRatio="none" aria-hidden="true">
            <image href={kitUrl} width="1024" height="765" />
          </svg>
          <section className="dex-detail" aria-label="선택한 건물">
            <h3>#{entry.number} {solved ? entry.name : '이름을 맞혀 보세요'}</h3>
            <div className="dex-photo"><canvas ref={previewRef} width="320" height="240" aria-label={solved ? entry.name : '이름을 가린 게임 속 건물 미리보기'} /></div>
            <div className="dex-clues">
              <p><span>위치</span> 흑석역에서 {entry.fromM}m · {entry.side === 'LEFT' ? '왼쪽' : '오른쪽'}</p>
              <p><span>글자 수</span> {getShopLetterCount(entry)}글자{nameParts.length > 1 ? ' + & 기본 제공' : ''}</p>
              {entry.kind === 'HOSPITAL' && <p className="dex-extra-clue">아주 큰 건물이에요.</p>}
              <div className="dex-letter-slots" aria-label={`이름 ${getShopLetterCount(entry)}글자${nameParts.length > 1 ? ', &는 기본 제공' : ''}`}>
                {Array.from(entry.name).map((letter, index) => <span key={index}>{solved || letter === '&' ? letter : '?'}</span>)}
              </div>
              {solved ? <p className="dex-registered">등록 완료</p> : (
                <form onSubmit={submitAnswer} className="dex-answer-form">
                  <div className="dex-answer-inputs">
                    {nameParts.map((part, index) => (
                      <label key={`${entry.id}-${index}`}>
                        {index > 0 && <span className="dex-provided-symbol" aria-hidden="true">&</span>}
                        <span className="dex-sr-only">가게 이름 {nameParts.length > 1 ? `${index + 1}번째 부분, ` : ''}{part.length}글자</span>
                        <input ref={index === 0 ? inputRef : undefined} value={parts[index] ?? ''} maxLength={part.length} placeholder={`${part.length}글자`} autoComplete="off" autoCorrect="off" spellCheck={false} onChange={(event) => { setParts((previous) => nameParts.map((_, i) => i === index ? event.target.value : previous[i] ?? '')); setFeedback(''); }} />
                      </label>
                    ))}
                  </div>
                  <button type="submit">이름 확인</button>
                </form>
              )}
              <p className="dex-feedback" role="status">{feedback}</p>
            </div>
          </section>
          <section className="dex-catalog" aria-label="도감 목록">
            <header><h3>가게 도감</h3><span>{solvedIds.length} / {SHOP_DEX_ENTRIES.length} 등록</span></header>
            <progress value={solvedIds.length} max={SHOP_DEX_ENTRIES.length} aria-label="도감 완성도" />
            <div className="dex-entry-list">
              {SHOP_DEX_ENTRIES.map((item) => {
                const registered = solvedIds.includes(item.id);
                return <button key={item.id} type="button" className={item.id === selectedId ? 'is-selected' : ''} aria-pressed={item.id === selectedId} onClick={() => selectEntry(item.id)}>
                  <span className={`dex-entry-mark${registered ? ' is-registered' : ''}`} aria-label={registered ? '등록' : '미등록'}>{registered ? '✓' : '?'}</span>
                  <span><strong>#{item.number} {registered ? item.name : '미등록'}</strong><small>{item.fromM}m · {item.side === 'LEFT' ? '왼쪽' : '오른쪽'} · {getShopLetterCount(item)}글자{item.name.includes('&') ? ' + &' : ''}</small></span>
                </button>;
              })}
            </div>
            <p className="dex-save-note">{storageUnavailable ? '저장 공간을 사용할 수 없어 이번 화면에서만 기록돼요.' : solvedIds.length === SHOP_DEX_ENTRIES.length ? '25곳 모두 등록했어요! 거리의 간판 박사!' : '맞힌 이름은 이 브라우저에 저장돼요.'}</p>
          </section>
        </div>
      </div>
    </div>
  );
};
