import { useEffect, useRef, useState, useCallback } from 'react';
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  GROUND_Y,
  INITIAL_SPEED,
  MAX_SPEED,
  SPEED_ACCELERATION_INTERVAL,
  SPEED_INCREMENT,
} from '../../../shared/config/gameConfig';
import { GameState, ScoreData } from '../../../shared/types';
import {
  createInitialPlayer,
  updatePlayerPhysics,
  jumpPlayer,
  startPlayerSlide,
  endPlayerSlide,
} from '../../../entities/player';
import {
  Obstacle,
  createObstacle,
  checkObstacleCollision,
  drawObstacles,
} from '../../../entities/obstacle';
import { Coin, createCoin, checkCoinCollision, drawCoins } from '../../../entities/coin';
import { drawPlayer } from '../../../entities/player/ui/drawPlayer';

const STORAGE_KEY = 'runnyang_highscore';

export const useGameEngine = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('READY');
  const [scoreData, setScoreData] = useState<ScoreData>(() => ({
    distance: 0,
    coins: 0,
    highScore: parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10),
  }));

  const engineStateRef = useRef({
    state: 'READY' as GameState,
    player: createInitialPlayer(),
    obstacles: [] as Obstacle[],
    coins: [] as Coin[],
    speed: INITIAL_SPEED,
    distance: 0,
    coinsCollected: 0,
    spawnTimer: 0,
    coinTimer: 0,
  });

  const startOrRestartGame = useCallback(() => {
    engineStateRef.current = {
      state: 'PLAYING',
      player: createInitialPlayer(),
      obstacles: [],
      coins: [],
      speed: INITIAL_SPEED,
      distance: 0,
      coinsCollected: 0,
      spawnTimer: 0,
      coinTimer: 0,
    };
    setGameState('PLAYING');
    setScoreData((prev) => ({ ...prev, distance: 0, coins: 0 }));
  }, []);

  const jump = useCallback(() => {
    if (engineStateRef.current.state === 'PLAYING') {
      jumpPlayer(engineStateRef.current.player);
    }
  }, []);

  const startSlide = useCallback(() => {
    if (engineStateRef.current.state === 'PLAYING') {
      startPlayerSlide(engineStateRef.current.player);
    }
  }, []);

  const endSlide = useCallback(() => {
    endPlayerSlide(engineStateRef.current.player);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = () => {
      const g = engineStateRef.current;

      if (g.state === 'PLAYING') {
        g.distance += 1;
        if (g.distance % SPEED_ACCELERATION_INTERVAL === 0 && g.speed < MAX_SPEED) {
          g.speed += SPEED_INCREMENT;
        }

        // Update player
        updatePlayerPhysics(g.player);

        // Spawn obstacles
        g.spawnTimer += 1;
        const spawnThreshold = Math.max(50, 100 - Math.floor(g.speed * 3));
        if (g.spawnTimer > spawnThreshold) {
          g.spawnTimer = 0;
          g.obstacles.push(createObstacle(Math.random() < 0.3));
        }

        // Spawn coins
        g.coinTimer += 1;
        if (g.coinTimer > 60) {
          g.coinTimer = 0;
          g.coins.push(createCoin(Math.random() > 0.5));
        }

        // Process obstacles
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          if (checkObstacleCollision(g.player, obs)) {
            g.state = 'GAMEOVER';
            setGameState('GAMEOVER');
            setScoreData((prev) => {
              const newHigh = Math.max(prev.highScore, g.distance);
              localStorage.setItem(STORAGE_KEY, newHigh.toString());
              return {
                distance: g.distance,
                coins: g.coinsCollected,
                highScore: newHigh,
              };
            });
            break;
          }

          if (obs.x + obs.width < -50) {
            g.obstacles.splice(i, 1);
          }
        }

        // Process coins
        for (let i = g.coins.length - 1; i >= 0; i--) {
          const coin = g.coins[i];
          coin.x -= g.speed;

          if (checkCoinCollision(g.player, coin)) {
            g.coinsCollected += 1;
            g.coins.splice(i, 1);
            setScoreData((prev) => ({ ...prev, coins: g.coinsCollected }));
            continue;
          }

          if (coin.x < -50) {
            g.coins.splice(i, 1);
          }
        }

        if (g.distance % 10 === 0) {
          setScoreData((prev) => ({ ...prev, distance: g.distance }));
        }
      }

      // Draw background & environment
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

      // Draw Entities
      drawPlayer(ctx, g.player);
      drawObstacles(ctx, g.obstacles);
      drawCoins(ctx, g.coins);

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
    jump,
    startSlide,
    endSlide,
  };
};
