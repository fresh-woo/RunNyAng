import React from 'react';
import { useGameEngine } from '../../../features/game-engine';
import { useGameControls } from '../../../features/controls';
import { HUD } from '../../../widgets/hud';
import { GameCanvas } from '../../../widgets/game-canvas';
import { ReadyOverlay } from '../../../widgets/ready-overlay';
import { GameOverModal } from '../../../widgets/game-over-modal';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const {
    canvasRef,
    gameState,
    scoreData,
    startOrRestartGame,
    jump,
    startSlide,
    endSlide,
  } = useGameEngine();

  useGameControls({
    onJump: jump,
    onSlideStart: startSlide,
    onSlideEnd: endSlide,
    onStartOrRestart: startOrRestartGame,
    isReadyOrGameOver: gameState === 'READY' || gameState === 'GAMEOVER',
  });

  return (
    <main className="game-page-container">
      <div className="game-frame">
        <HUD scoreData={scoreData} />

        <GameCanvas canvasRef={canvasRef} onTouchStart={jump} />

        {gameState === 'READY' && <ReadyOverlay onStart={startOrRestartGame} />}

        {gameState === 'GAMEOVER' && (
          <GameOverModal scoreData={scoreData} onRetry={startOrRestartGame} />
        )}

        <footer className="controls-hint-bar">
          🎮 조작법: [스페이스 / ↑] 점프 (2단 점프) | [↓] 슬라이딩 | 모바일: 화면 터치 점프
        </footer>
      </div>
    </main>
  );
};
