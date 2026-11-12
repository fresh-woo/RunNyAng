import { useEffect, useRef, useState, useCallback } from 'react';
import { STAGE_LENGTH } from '../../../shared/config/gameConfig';
import { GameState, ScoreData } from '../../../shared/types';
import {
  createInitialPlayer,
  updatePlayerMovement,
  drawPlayer,
  MovementInput,
} from '../../../entities/player';
import {
  getStage1Objects,
  StageObject,
  drawCampusEnvironment,
  drawStageObjects,
} from '../../../entities/stage';

const STORAGE_KEY = 'runnyang_cau_highscore';

export const useGameEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('READY');
  const [scoreData, setScoreData] = useState<ScoreData>(() => ({
    distance: 0,
    maxDistance: STAGE_LENGTH,
    progressPercent: 0,
    coins: 0,
    highScore: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10),
    elapsedSeconds: 0,
  }));

  const inputRef = useRef<MovementInput>({
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  });

  const engineStateRef = useRef({
    state: 'READY' as GameState,
    player: createInitialPlayer(),
    objects: getStage1Objects() as StageObject[],
    coinsCollected: 0,
    startTime: 0,
    lastFrameTime: performance.now(),
  });

  const setInput = useCallback((input: MovementInput) => {
    inputRef.current = input;
  }, []);

  const startOrRestartGame = useCallback(() => {
    engineStateRef.current = {
      state: 'PLAYING',
      player: createInitialPlayer(),
      objects: getStage1Objects(),
      coinsCollected: 0,
      startTime: Date.now(),
      lastFrameTime: performance.now(),
    };
    setGameState('PLAYING');
    setScoreData((prev) => ({
      ...prev,
      distance: 0,
      progressPercent: 0,
      coins: 0,
      elapsedSeconds: 0,
    }));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (currentTime: number) => {
      const g = engineStateRef.current;
      const deltaTime = Math.min(100, currentTime - g.lastFrameTime);
      g.lastFrameTime = currentTime;

      if (g.state === 'PLAYING') {
        // Move player
        updatePlayerMovement(g.player, inputRef.current, deltaTime);

        const currentDist = Math.floor(g.player.worldY);
        const progress = Math.min(100, Math.floor((currentDist / STAGE_LENGTH) * 100));
        const elapsed = Math.floor((Date.now() - g.startTime) / 1000);

        // Check collisions with stage objects
        for (const obj of g.objects) {
          if (obj.collected) continue;

          // Check if object is in player Y range
          const distDiff = Math.abs(obj.worldY - g.player.worldY);
          if (distDiff < (g.player.height + obj.height) / 2) {
            // Check X collision (AABB)
            if (
              g.player.x < obj.x + obj.width &&
              g.player.x + g.player.width > obj.x
            ) {
              if (obj.type === 'OBSTACLE') {
                g.state = 'GAMEOVER';
                setGameState('GAMEOVER');
                setScoreData((prev) => ({
                  ...prev,
                  distance: currentDist,
                  progressPercent: progress,
                  elapsedSeconds: elapsed,
                }));
                break;
              } else if (obj.type === 'ITEM') {
                obj.collected = true;
                g.coinsCollected += 1;
                setScoreData((prev) => ({ ...prev, coins: g.coinsCollected }));
              } else if (obj.type === 'FINISH_LINE') {
                g.state = 'CLEAR';
                setGameState('CLEAR');
                setScoreData((prev) => {
                  const newHigh = Math.max(prev.highScore, currentDist);
                  localStorage.setItem(STORAGE_KEY, newHigh.toString());
                  return {
                    ...prev,
                    distance: currentDist,
                    progressPercent: 100,
                    coins: g.coinsCollected,
                    highScore: newHigh,
                    elapsedSeconds: elapsed,
                  };
                });
                break;
              }
            }
          }
        }

        setScoreData((prev) => ({
          ...prev,
          distance: currentDist,
          progressPercent: progress,
          elapsedSeconds: elapsed,
        }));
      }

      // Draw Campus Environment
      drawCampusEnvironment(ctx, g.player.worldY);

      // Draw Stage Objects (Landmarks, Obstacles, Finish Line)
      drawStageObjects(ctx, g.objects, g.player.worldY, g.player.screenY);

      // Draw Player Cat (2~3 Frame cycle)
      drawPlayer(ctx, g.player);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return {
    canvasRef,
    gameState,
    scoreData,
    startOrRestartGame,
    setInput,
  };
};
