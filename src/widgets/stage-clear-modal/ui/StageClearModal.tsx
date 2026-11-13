import React from 'react';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import { Button } from '../../../shared/ui/Button/Button';
import { ScoreData } from '../../../shared/types';
import catEatUrl from '../../../assets/images/cat/cat_eat.png';

interface StageClearModalProps {
  scoreData: ScoreData;
  onRetry: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({ scoreData, onRetry }) => {
  const minutes = Math.floor(scoreData.elapsedSeconds / 60);
  const remainingSeconds = (scoreData.elapsedSeconds % 60).toFixed(1);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${remainingSeconds.padStart(4, '0')} (${scoreData.elapsedSeconds}초)`;

  const bestMinutes = scoreData.bestTimeSeconds !== null ? Math.floor(scoreData.bestTimeSeconds / 60) : null;
  const bestRemaining = scoreData.bestTimeSeconds !== null ? (scoreData.bestTimeSeconds % 60).toFixed(1) : null;
  const formattedBestTime =
    scoreData.bestTimeSeconds !== null && bestMinutes !== null && bestRemaining !== null
      ? `${String(bestMinutes).padStart(2, '0')}:${bestRemaining.padStart(4, '0')} (${scoreData.bestTimeSeconds}초)`
      : null;

  return (
    <Overlay>
      <img
        src={catEatUrl}
        alt="츄르 먹는 냥이"
        style={{
          height: '110px',
          width: 'auto',
          marginBottom: '8px',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
        }}
        draggable={false}
      />
      <h2 style={{ fontSize: '2.2rem', color: '#38bdf8', marginBottom: '12px' }}>STAGE CLEAR! 🎉</h2>
      <p style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>
        310관(100주년 기념관) 무사 도착 완료!
      </p>

      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(30, 41, 59, 0.7)', padding: '16px 32px', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.2rem', color: '#38bdf8' }}>
          ⏱️ 최종 소요 시간: <strong>{formattedTime}</strong>
        </p>
        {formattedBestTime && (
          <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>
            🏆 최고 기록: <strong>{formattedBestTime}</strong>
          </p>
        )}
        <p style={{ fontSize: '1.05rem', color: '#facc15' }}>수집한 츄르: <strong>{scoreData.coins}개</strong></p>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>도착 거리: {scoreData.distance}m</p>
      </div>

      <Button variant="retry" onClick={onRetry}>
        다시 달리기
      </Button>
    </Overlay>
  );
};


