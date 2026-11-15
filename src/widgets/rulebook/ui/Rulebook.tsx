import { useEffect, useRef } from 'react';
import rulebookUrl from '../../../assets/images/story/rulebook.png';
import './Rulebook.css';

interface RulebookProps {
  onStart: () => void;
}

export const Rulebook = ({ onStart }: RulebookProps) => {
  const startButtonRef = useRef<HTMLButtonElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    startButtonRef.current?.focus();
  }, []);

  const start = () => {
    if (startedRef.current) return;
    startedRef.current = true;
    onStart();
  };

  return (
    <section
      className="rulebook"
      aria-label="게임 방법과 룰북"
      onKeyDown={(event) => {
        if (event.code !== 'Enter' && event.code !== 'Space') return;
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) start();
      }}
    >
      <div className="rulebook-media" tabIndex={0} role="region" aria-label="룰북 이미지. 작은 화면에서는 스크롤해 읽을 수 있습니다.">
        <img src={rulebookUrl} alt="RunNyAng 게임 방법과 룰북: 목표, 방향키 조작, 수집 아이템과 장애물 안내" draggable={false} />
      </div>
      <footer className="rulebook-actions">
        <span className="rulebook-mobile-hint">좌우로 밀어 룰북을 읽어 보세요.</span>
        <button ref={startButtonRef} type="button" onClick={start}>확인했어요, 출발!</button>
      </footer>
    </section>
  );
};
