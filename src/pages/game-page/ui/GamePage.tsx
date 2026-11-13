import React, { useEffect } from 'react';
import { useGameEngine } from '../../../features/game-engine';
import { useGameControls } from '../../../features/controls';
import { HUD } from '../../../widgets/hud';
import { GameCanvas } from '../../../widgets/game-canvas';
import { ReadyOverlay } from '../../../widgets/ready-overlay';
import { GameOverModal } from '../../../widgets/game-over-modal';
import { StageClearModal } from '../../../widgets/stage-clear-modal';
import { MobileDPad } from '../../../widgets/mobile-dpad';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const {
    canvasRef,
    gameState,
    scoreData,
    startOrRestartGame,
    setInput,
  } = useGameEngine();

  const isReadyOrEnded = gameState === 'READY' || gameState === 'GAMEOVER' || gameState === 'CLEAR';

  const {
    movementInput,
    handleTouchStart,
    handleTouchEnd,
    setMoveLeft,
    setMoveRight,
    setMoveUp,
    setMoveDown,
  } = useGameControls({
    onStartOrRestart: startOrRestartGame,
    isReadyOrEnded,
  });

  // Sync controls input with game engine
  useEffect(() => {
    setInput(movementInput);
  }, [movementInput, setInput]);

  return (
    <main className="game-page-container">
      <div className="game-frame">
        <HUD scoreData={scoreData} />

        <GameCanvas
          canvasRef={canvasRef}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleTouchStart(touch.clientX, window.innerWidth);
          }}
          onTouchEnd={handleTouchEnd}
        />

        {gameState === 'READY' && <ReadyOverlay onStart={startOrRestartGame} />}

        {gameState === 'GAMEOVER' && (
          <GameOverModal scoreData={scoreData} onRetry={startOrRestartGame} />
        )}

        {gameState === 'CLEAR' && (
          <StageClearModal scoreData={scoreData} onRetry={startOrRestartGame} />
        )}

        {/* 모바일 D-PAD 가상 방향키 (인게임 중에만 표시) */}
        {gameState === 'PLAYING' && (
          <MobileDPad
            onLeft={setMoveLeft}
            onRight={setMoveRight}
            onUp={setMoveUp}
            onDown={setMoveDown}
          />
        )}

        <footer className="controls-hint-bar">
          🎮 조작법: [← / →] 좌우 이동 | [↑ / W] 가속 | [↓ / S] 감속 | 모바일: 화면 하단 D-PAD
        </footer>
      </div>
    </main>
  );
};

