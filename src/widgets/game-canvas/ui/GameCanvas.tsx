import React from 'react';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '../../../shared/config/gameConfig';
import './GameCanvas.css';

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onTouchStart?: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchEnd?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  canvasRef,
  onTouchStart,
  onTouchEnd,
}) => {
  return (
    <canvas
      ref={canvasRef}
      className="widget-game-canvas"
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    />
  );
};
