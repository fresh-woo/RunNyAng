import { useEffect, useRef, useState, useCallback } from 'react';
import {
  STAGE_LENGTH,
  PIXELS_PER_METER,
  OBSTACLE_STUN_DURATION_MS,
} from '../../../shared/config/gameConfig';
import { GameState, ScoreData } from '../../../shared/types';
import {
  createInitialPlayer,
  updatePlayerMovement,
  MovementInput,
} from '../../../entities/player';
import {
  getStage1Objects,
  getZoneAt,
  StageObject,
  drawCampusEnvironment,
  drawStageObjects,
} from '../../../entities/stage';
import { loadGameAssets, GameAssets } from '../../../shared/lib/assetLoader';

const STORAGE_KEY_BEST_TIME = 'runnyang_cau_best_time';
const STORAGE_KEY_HIGHSCORE = 'runnyang_cau_highscore';

const getStoredBestTime = (): number | null => {
  const val = localStorage.getItem(STORAGE_KEY_BEST_TIME);
  if (!val) return null;
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
};

export const useGameEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('READY');
  const [scoreData, setScoreData] = useState<ScoreData>(() => ({
    distance: 0,
    maxDistance: STAGE_LENGTH,
    progressPercent: 0,
    coins: 0,
    highScore: parseInt(localStorage.getItem(STORAGE_KEY_HIGHSCORE) || '0', 10),
    elapsedSeconds: 0,
    bestTimeSeconds: getStoredBestTime(),
    currentZoneLabel: getZoneAt(0).label,
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

  const assetsRef = useRef<GameAssets | null>(null);

  const setInput = useCallback((input: MovementInput) => {
    inputRef.current = input;
  }, []);

  const startOrRestartGame = useCallback(() => {
    engineStateRef.current = {
      state: 'PLAYING',
      player: createInitialPlayer(),
      objects: getStage1Objects(),
      coinsCollected: 0,
      startTime: performance.now(),
      lastFrameTime: performance.now(),
    };
    setGameState('PLAYING');
    setScoreData((prev) => ({
      ...prev,
      distance: 0,
      progressPercent: 0,
      coins: 0,
      elapsedSeconds: 0,
      bestTimeSeconds: getStoredBestTime(),
      currentZoneLabel: getZoneAt(0).label,
    }));
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 픽셀아트 안티앨리어싱 OFF
    ctx.imageSmoothingEnabled = false;

    // 에셋 비동기 로드 (렌더링은 로드 완료 전에도 fallback으로 동작)
    loadGameAssets().then((assets) => {
      assetsRef.current = assets;
    });

    const gameLoop = (currentTime: number) => {
      const g = engineStateRef.current;
      const deltaTime = Math.min(100, currentTime - g.lastFrameTime);
      g.lastFrameTime = currentTime;

      if (g.state === 'PLAYING') {
        // Move player
        updatePlayerMovement(g.player, inputRef.current, deltaTime);

        const currentDist = Math.min(STAGE_LENGTH, Math.floor(g.player.worldY));
        const progress = Math.min(100, Math.floor((currentDist / STAGE_LENGTH) * 100));
        // 실시간 경과 시간 (소수점 1자리 초)
        const elapsed = Math.round(((currentTime - g.startTime) / 1000) * 10) / 10;

        // Check collisions with stage objects
        for (const obj of g.objects) {
          if (obj.collected) continue;

          // Check if object is in player Y range (픽셀 단위 변환)
          const distDiff = Math.abs(obj.worldY - g.player.worldY) * PIXELS_PER_METER;
          if (distDiff < (g.player.height + obj.height) / 2) {
            // Check X collision (AABB)
            if (
              g.player.x < obj.x + obj.width &&
              g.player.x + g.player.width > obj.x
            ) {
              if (obj.type === 'OBSTACLE') {
                // 타임어택 모드: 목숨 소진/게임오버 대신 '경직/감속 페널티' 부여
                obj.collected = true; // 1회 피격 후 통과 처리
                g.player.stunTimerMs = OBSTACLE_STUN_DURATION_MS;
              } else if (obj.type === 'ITEM') {
                obj.collected = true;
                g.coinsCollected += 1;
                setScoreData((prev) => ({ ...prev, coins: g.coinsCollected }));
              } else if (obj.type === 'FINISH_LINE') {
                g.state = 'CLEAR';
                setGameState('CLEAR');
                const finalElapsed = elapsed;
                setScoreData((prev) => {
                  const currentBest = prev.bestTimeSeconds;
                  const newBest =
                    currentBest === null || finalElapsed < currentBest
                      ? finalElapsed
                      : currentBest;
                  localStorage.setItem(STORAGE_KEY_BEST_TIME, newBest.toString());

                  const newHigh = Math.max(prev.highScore, currentDist);
                  localStorage.setItem(STORAGE_KEY_HIGHSCORE, newHigh.toString());

                  return {
                    ...prev,
                    distance: currentDist,
                    progressPercent: 100,
                    coins: g.coinsCollected,
                    highScore: newHigh,
                    elapsedSeconds: finalElapsed,
                    bestTimeSeconds: newBest,
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
          currentZoneLabel: getZoneAt(currentDist).label,
        }));
      }

      // Draw Campus Environment (Sky, 3/4 Perspective Road, Buildings, Greenery)
      drawCampusEnvironment(ctx, g.player.worldY);

      // Draw Stage Objects & Player Cat with Depth Sorting
      drawStageObjects(ctx, g.objects, g.player, assetsRef.current);

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

