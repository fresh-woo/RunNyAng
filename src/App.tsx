import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { GameState, Obstacle, Coin } from './types/game';

const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const GROUND_Y = 440;
const GRAVITY = 0.8;
const JUMP_FORCE = -15;

export const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [gameState, setGameState] = useState<GameState>('READY');
  const [distance, setDistance] = useState<number>(0);
  const [coins, setCoins] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(() => {
    return parseInt(localStorage.getItem('runnyang_highscore') || '0', 10);
  });

  const gameStateRef = useRef<{
    state: GameState;
    player: {
      x: number;
      y: number;
      width: number;
      height: number;
      velocityY: number;
      isJumping: boolean;
      jumpCount: number;
      isSliding: boolean;
    };
    obstacles: Obstacle[];
    coins: Coin[];
    speed: number;
    distance: number;
    coinsCollected: number;
    spawnTimer: number;
    coinTimer: number;
  }>({
    state: 'READY',
    player: {
      x: 120,
      y: GROUND_Y - 60,
      width: 44,
      height: 60,
      velocityY: 0,
      isJumping: false,
      jumpCount: 0,
      isSliding: false,
    },
    obstacles: [],
    coins: [],
    speed: 6,
    distance: 0,
    coinsCollected: 0,
    spawnTimer: 0,
    coinTimer: 0,
  });

  const resetGame = () => {
    gameStateRef.current = {
      state: 'PLAYING',
      player: {
        x: 120,
        y: GROUND_Y - 60,
        width: 44,
        height: 60,
        velocityY: 0,
        isJumping: false,
        jumpCount: 0,
        isSliding: false,
      },
      obstacles: [],
      coins: [],
      speed: 6,
      distance: 0,
      coinsCollected: 0,
      spawnTimer: 0,
      coinTimer: 0,
    };
    setDistance(0);
    setCoins(0);
    setGameState('PLAYING');
  };

  const jump = () => {
    const { player, state } = gameStateRef.current;
    if (state !== 'PLAYING') return;

    if (player.jumpCount < 2) {
      player.velocityY = JUMP_FORCE;
      player.isJumping = true;
      player.jumpCount += 1;
      player.isSliding = false;
      player.height = 60;
    }
  };

  const slideStart = () => {
    const { player, state } = gameStateRef.current;
    if (state !== 'PLAYING' || player.isJumping) return;

    player.isSliding = true;
    player.height = 32;
    player.y = GROUND_Y - 32;
  };

  const slideEnd = () => {
    const { player } = gameStateRef.current;
    if (player.isSliding) {
      player.isSliding = false;
      player.height = 60;
      player.y = GROUND_Y - 60;
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (gameStateRef.current.state === 'READY' || gameStateRef.current.state === 'GAMEOVER') {
          resetGame();
        } else {
          jump();
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        slideStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        slideEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main Game Loop
  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateAndDraw = () => {
      const g = gameStateRef.current;

      if (g.state === 'PLAYING') {
        // Update distance & speed
        g.distance += 1;
        if (g.distance % 500 === 0 && g.speed < 14) {
          g.speed += 0.5;
        }

        // Player physics
        g.player.y += g.player.velocityY;
        g.player.velocityY += GRAVITY;

        // Ground collision
        const currentGround = GROUND_Y - g.player.height;
        if (g.player.y >= currentGround) {
          g.player.y = currentGround;
          g.player.velocityY = 0;
          g.player.isJumping = false;
          g.player.jumpCount = 0;
        }

        // Spawn obstacles
        g.spawnTimer += 1;
        if (g.spawnTimer > Math.max(50, 100 - Math.floor(g.speed * 3))) {
          g.spawnTimer = 0;
          const isFlying = Math.random() < 0.3;
          g.obstacles.push({
            id: Date.now() + Math.random(),
            x: CANVAS_WIDTH + 50,
            y: isFlying ? GROUND_Y - 80 : GROUND_Y - 45,
            width: isFlying ? 40 : 35,
            height: isFlying ? 25 : 45,
            type: isFlying ? 'FLYING' : 'GROUND',
            passed: false,
          });
        }

        // Spawn coins
        g.coinTimer += 1;
        if (g.coinTimer > 60) {
          g.coinTimer = 0;
          g.coins.push({
            id: Date.now() + Math.random(),
            x: CANVAS_WIDTH + 50,
            y: GROUND_Y - (Math.random() > 0.5 ? 90 : 40),
            radius: 12,
            collected: false,
          });
        }

        // Move & check obstacles
        for (let i = g.obstacles.length - 1; i >= 0; i--) {
          const obs = g.obstacles[i];
          obs.x -= g.speed;

          // Collision detection (AABB)
          if (
            g.player.x < obs.x + obs.width &&
            g.player.x + g.player.width > obs.x &&
            g.player.y < obs.y + obs.height &&
            g.player.y + g.player.height > obs.y
          ) {
            g.state = 'GAMEOVER';
            setGameState('GAMEOVER');
            setHighScore((prev) => {
              const newHigh = Math.max(prev, g.distance);
              localStorage.setItem('runnyang_highscore', newHigh.toString());
              return newHigh;
            });
          }

          if (obs.x + obs.width < -50) {
            g.obstacles.splice(i, 1);
          }
        }

        // Move & check coins
        for (let i = g.coins.length - 1; i >= 0; i--) {
          const coin = g.coins[i];
          coin.x -= g.speed;

          // Simple circle-box collision
          const distX = Math.abs(coin.x - (g.player.x + g.player.width / 2));
          const distY = Math.abs(coin.y - (g.player.y + g.player.height / 2));

          if (distX < g.player.width / 2 + coin.radius && distY < g.player.height / 2 + coin.radius) {
            g.coinsCollected += 1;
            g.coins.splice(i, 1);
            setCoins(g.coinsCollected);
            continue;
          }

          if (coin.x < -50) {
            g.coins.splice(i, 1);
          }
        }

        if (g.distance % 10 === 0) {
          setDistance(g.distance);
        }
      }

      // Drawing
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Sky Background gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      skyGrad.addColorStop(0, '#0f172a');
      skyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Ground Line
      ctx.fillStyle = '#334155';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

      // Draw Player (Temp Cat representation)
      ctx.fillStyle = g.player.isSliding ? '#f59e0b' : '#38bdf8';
      ctx.beginPath();
      ctx.roundRect(g.player.x, g.player.y, g.player.width, g.player.height, 8);
      ctx.fill();

      // Draw Player Ear/Face hint
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(g.player.x + (g.player.isSliding ? 34 : 32), g.player.y + (g.player.isSliding ? 12 : 16), 4, 0, Math.PI * 2);
      ctx.fill();

      // Draw Obstacles
      ctx.fillStyle = '#ef4444';
      for (const obs of g.obstacles) {
        ctx.beginPath();
        ctx.roundRect(obs.x, obs.y, obs.width, obs.height, 4);
        ctx.fill();
      }

      // Draw Coins
      ctx.fillStyle = '#eab308';
      for (const coin of g.coins) {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(updateAndDraw);
    };

    animationFrameId = requestAnimationFrame(updateAndDraw);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="game-wrapper">
      <div className="hud">
        <div>거리: {distance}m</div>
        <div>🪙 {coins}</div>
        <div>최고기록: {highScore}m</div>
      </div>

      <canvas
        ref={canvasRef}
        className="game-canvas"
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        onTouchStart={jump}
      />

      {gameState === 'READY' && (
        <div className="overlay">
          <h1 style={{ fontSize: '2.5rem', marginBottom: '8px', color: '#38bdf8' }}>🐾 RunNyAng</h1>
          <p style={{ color: '#cbd5e1' }}>귀여운 고양이와 함께 달리는 2D 런닝 웹앱 게임</p>
          <button className="btn-primary" onClick={resetGame}>
            게임 시작 (Start)
          </button>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="overlay">
          <h2 style={{ fontSize: '2rem', color: '#f87171', marginBottom: '12px' }}>GAME OVER</h2>
          <p>이번 기록: {distance}m</p>
          <p>획득 코인: {coins}개</p>
          <button className="btn-primary" onClick={resetGame}>
            다시 달리기 (Retry)
          </button>
        </div>
      )}

      <div className="controls-hint">
        🎮 조작법: [스페이스 / ↑] 점프 (2단 점프 가능) | [↓] 슬라이딩 | 모바일: 화면 터치 점프
      </div>
    </div>
  );
};

export default App;
