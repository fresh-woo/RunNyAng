import React from 'react';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import { Button } from '../../../shared/ui/Button/Button';
import { ScoreData } from '../../../shared/types';

interface StageClearModalProps {
  scoreData: ScoreData;
  onRetry: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({ scoreData, onRetry }) => {
  return (
    <Overlay>
      <div style={{ fontSize: '3rem', marginBottom: '8px' }}>🎓🎉</div>
      <h2 style={{ fontSize: '2.2rem', color: '#38bdf8', marginBottom: '12px' }}>STAGE CLEAR!</h2>
      <p style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px' }}>
        310관(100주년 기념관) 무사 도착 완료!
      </p>

      <div style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '8px', background: 'rgba(30, 41, 59, 0.7)', padding: '16px 32px', borderRadius: '12px' }}>
        <p style={{ fontSize: '1rem', color: '#cbd5e1' }}>소요 시간: <strong>{scoreData.elapsedSeconds}초</strong></p>
        <p style={{ fontSize: '1.1rem', color: '#facc15' }}>수집한 츄르: <strong>{scoreData.coins}개</strong></p>
        <p style={{ fontSize: '0.9rem', color: '#94a3b8' }}>도착 거리: {scoreData.distance}m</p>
      </div>

      <Button variant="primary" onClick={onRetry}>
        다시 달리기 (Retry)
      </Button>
    </Overlay>
  );
};
