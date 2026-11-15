import { useEffect, useId, useRef } from 'react';
import { Difficulty } from '../../../shared/types';
import modeButtonsUrl from '../../../assets/images/difficulty/mode_buttons.png';
import '../../../shared/ui/Overlay/Overlay.css';
import './DifficultySelection.css';

interface DifficultySelectionProps {
  onSelect: (difficulty: Difficulty) => void;
}

const modes = [
  { id: 'NORMAL', title: '일반 모드', viewBox: '49 258 297 117', description: '장애물에 닿으면 잠시 느려져요. 다시 달려 310관에 도착하세요.' },
  { id: 'HARDCORE', title: '하드코어 모드', viewBox: '49 444 297 117', description: '단 한 번의 충돌도 허용되지 않아요. 장애물에 닿으면 즉시 실패!' },
] as const;

export const DifficultySelection = ({ onSelect }: DifficultySelectionProps) => {
  const clipId = useId();
  const normalButtonRef = useRef<HTMLButtonElement>(null);
  const selectedRef = useRef(false);
  useEffect(() => { normalButtonRef.current?.focus(); }, []);

  const select = (difficulty: Difficulty) => {
    if (selectedRef.current) return;
    selectedRef.current = true;
    onSelect(difficulty);
  };

  return (
    <section className="ui-overlay difficulty-selection" aria-labelledby="difficulty-title">
      <h2 id="difficulty-title">어떤 모드로 달려볼까요?</h2>
      <p className="difficulty-intro">정문에서 310관까지, 나에게 맞는 도전을 골라 주세요.</p>
      <div className="difficulty-modes">
        {modes.map((mode, index) => (
          <div className="difficulty-mode" key={mode.id}>
            <button
              ref={index === 0 ? normalButtonRef : undefined}
              type="button"
              onClick={() => select(mode.id)}
              onKeyDown={(event) => { if (event.repeat) event.preventDefault(); }}
              aria-label={mode.title}
              aria-describedby={`difficulty-${mode.id}-description`}
            >
              <svg viewBox="0 0 297 117" aria-hidden="true">
                <defs>
                  <clipPath id={`${clipId}-${mode.id}`}>
                    <path d="M44 3H253V7H267V12H274V18H279V24H284V31H286V41H292V75H286V86H282V92H276V97H271V102H267V107H256V112H40V107H29V102H24V97H19V92H14V86H10V76H4V41H10V31H12V26H17V21H22V16H27V11H40V7H44Z" />
                  </clipPath>
                </defs>
                <g clipPath={`url(#${clipId}-${mode.id})`}>
                  <svg width="297" height="117" viewBox={mode.viewBox} overflow="hidden">
                    <image href={modeButtonsUrl} width="1024" height="765" />
                  </svg>
                </g>
              </svg>
            </button>
            <p id={`difficulty-${mode.id}-description`}>{mode.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};
