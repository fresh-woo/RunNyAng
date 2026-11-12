import React from 'react';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import { Button } from '../../../shared/ui/Button/Button';

interface ReadyOverlayProps {
  onStart: () => void;
}

export const ReadyOverlay: React.FC<ReadyOverlayProps> = ({ onStart }) => {
  return (
    <Overlay>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#38bdf8' }}>🐾 RunNyAng</h1>
      <p style={{ color: '#cbd5e1', marginBottom: '24px' }}>
        귀여운 고양이와 함께 달리는 2D 런닝 웹앱 게임
      </p>
      <Button variant="primary" onClick={onStart}>
        게임 시작 (Start)
      </Button>
    </Overlay>
  );
};
