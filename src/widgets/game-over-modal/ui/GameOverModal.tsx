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
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>💥😿</div>
      <h2 style={{ fontSize: '2rem', color: '#f87171', marginBottom: '12px' }}>앗, 넘어졌습니다!</h2>
      <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '16px' }}>
        장애물에 걸려 310관까지 가지 못했습니다.
      </p>

      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(30, 41, 59, 0.7)', padding: '16px 28px', borderRadius: '12px' }}>
        <p style={{ fontSize: '1.1rem' }}>달성 진척도: <strong>{scoreData.progressPercent}%</strong> ({scoreData.distance}m)</p>
        <p style={{ fontSize: '1.05rem', color: '#facc15' }}>수집한 츄르: <strong>{scoreData.coins}개</strong></p>
      </div>

      <Button variant="primary" onClick={onRetry}>
        정문에서 다시 달리기 (Retry)
      </Button>
    </Overlay>
  );
};
