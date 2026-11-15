import React, { useEffect } from 'react';
import { useGameEngine } from '../../../features/game-engine';
import { useGameControls } from '../../../features/controls';
import { HUD } from '../../../widgets/hud';
import { GameCanvas } from '../../../widgets/game-canvas';
import { ReadyOverlay } from '../../../widgets/ready-overlay';
import { GameOverModal } from '../../../widgets/game-over-modal';
import { StageClearModal } from '../../../widgets/stage-clear-modal';
import { PauseOverlay } from '../../../widgets/pause-overlay';
import { MobileDPad } from '../../../widgets/mobile-dpad';
import { EventBanner } from '../../../widgets/event-banner';
import { StoryCutscene } from '../../../widgets/story-cutscene';
import { Rulebook } from '../../../widgets/rulebook';
import { DifficultySelection } from '../../../widgets/difficulty-selection';
import './GamePage.css';

export const GamePage: React.FC = () => {
  const {
    canvasRef,
    gameState,
    difficulty,
    scoreData,
    eventMessage,
    startOrRestartGame,
    beginStory,
    showDifficultySelection,
    selectDifficulty,
    returnToStart,
    resumeGame,
    togglePause,
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
    onStartOrRestart: gameState === 'READY' ? beginStory : startOrRestartGame,
    onTogglePause: togglePause,
    gameState,
    isReadyOrEnded,
  });

  // Sync controls input with game engine
  useEffect(() => {
    setInput(movementInput);
  }, [movementInput, setInput]);

  return (
    <main className="game-page-container">
      <div className="game-frame">
        {gameState !== 'INTRO' && gameState !== 'DIFFICULTY' && gameState !== 'RULEBOOK' && gameState !== 'GAMEOVER' && <HUD
          scoreData={scoreData}
          difficulty={difficulty}
          gameState={gameState}
          onTogglePause={togglePause}
        />}

        {gameState === 'PLAYING' && <EventBanner message={eventMessage} />}

        <GameCanvas
          canvasRef={canvasRef}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            handleTouchStart(touch.clientX, window.innerWidth);
          }}
          onTouchEnd={handleTouchEnd}
        />

        {gameState === 'READY' && <ReadyOverlay onStart={beginStory} />}

        {gameState === 'INTRO' && <StoryCutscene onComplete={showDifficultySelection} />}

        {gameState === 'DIFFICULTY' && <DifficultySelection onSelect={selectDifficulty} />}

        {gameState === 'RULEBOOK' && <Rulebook onStart={startOrRestartGame} />}

        {gameState === 'PAUSED' && (
          <PauseOverlay onResume={resumeGame} onReturnToStart={returnToStart} />
        )}

        {gameState === 'GAMEOVER' && (
          <GameOverModal scoreData={scoreData} onRetry={startOrRestartGame} onReturnToStart={returnToStart} />
        )}

        {gameState === 'CLEAR' && (
          <StageClearModal scoreData={scoreData} onRetry={startOrRestartGame} onReturnToStart={returnToStart} />
        )}

        {/* 모바일 D-PAD 가상 방향키 (인게임 플레이 중에만 표시) */}
        {gameState === 'PLAYING' && (
          <MobileDPad
            onLeft={setMoveLeft}
            onRight={setMoveRight}
            onUp={setMoveUp}
            onDown={setMoveDown}
          />
        )}

      </div>
    </main>
  );
};

