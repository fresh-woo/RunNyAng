import { useEffect, useRef } from 'react';
import { Button } from '../../../shared/ui/Button/Button';
import { ScoreData } from '../../../shared/types';
import gameOverUrl from '../../../assets/images/difficulty/game_over.png';
import './GameOverModal.css';

interface GameOverModalProps {
  scoreData: ScoreData;
  onRetry: () => void;
  onReturnToStart: () => void;
}

export const GameOverModal = ({ scoreData, onRetry, onReturnToStart }: GameOverModalProps) => {
  const sectionRef = useRef<HTMLElement>(null);
  useEffect(() => { sectionRef.current?.focus(); }, []);
  return (
    <section ref={sectionRef} tabIndex={-1} className="game-over-screen" aria-label="하드코어 도전 실패">
      <div className="game-over-art">
        <img src={gameOverUrl} alt="GAME OVER. 310관 앞에서 눈물을 흘리는 중냥이" draggable={false} />
      </div>
      <div className="game-over-results">
        <p>장애물에 부딪혔어요. 하드코어 도전 실패!</p>
        <p>도달 거리 <strong>{scoreData.distance}m ({scoreData.progressPercent}%)</strong> · 츄르 <strong>{scoreData.coins}개</strong></p>
        <div className="game-over-actions">
          <Button type="button" variant="retry" onClick={onRetry}>하드코어 다시 도전</Button>
          <Button type="button" variant="home" onClick={onReturnToStart}>처음으로 돌아가기</Button>
        </div>
      </div>
    </section>
  );
};

