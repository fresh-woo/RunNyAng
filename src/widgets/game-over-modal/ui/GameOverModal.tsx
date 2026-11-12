import React from 'react';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import { Button } from '../../../shared/ui/Button/Button';
import { ScoreData } from '../../../shared/types';

interface GameOverModalProps {
  scoreData: ScoreData;
  onRetry: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ scoreData, onRetry }) => {
  return (
    <Overlay>
      <h2 style={{ fontSize: '2rem', color: '#f87171', marginBottom: '16px' }}>GAME OVER</h2>
      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontSize: '1.2rem' }}>이번 기록: <strong>{scoreData.distance}m</strong></p>
        <p style={{ fontSize: '1.1rem', color: '#facc15' }}>획득 코인: <strong>{scoreData.coins}개</strong></p>
        <p style={{ fontSize: '0.95rem', color: '#94a3b8' }}>최고 기록: {scoreData.highScore}m</p>
      </div>
      <Button variant="primary" onClick={onRetry}>
        다시 달리기 (Retry)
      </Button>
    </Overlay>
  );
};
