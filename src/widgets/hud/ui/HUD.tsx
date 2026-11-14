import React from 'react';
import { ScoreData, GameState } from '../../../shared/types';
import './HUD.css';
import iconChuruUrl from '../../../assets/images/ui/icon_churu.png';
import catPortraitUrl from '../../../assets/images/cat/cat_portrait.png';
import btnPauseUrl from '../../../assets/images/ui/btn_pause.png';
import btnPlayUrl from '../../../assets/images/ui/btn_play.png';

interface HUDProps {
  scoreData: ScoreData;
  gameState?: GameState;
  onTogglePause?: () => void;
}

export const HUD: React.FC<HUDProps> = ({ scoreData, gameState, onTogglePause }) => {
  const minutes = Math.floor(scoreData.elapsedSeconds / 60);
  const remainingSeconds = (scoreData.elapsedSeconds % 60).toFixed(1);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${remainingSeconds.padStart(4, '0')}`;

  const isPaused = gameState === 'PAUSED';
  const showPauseButton = onTogglePause && (gameState === 'PLAYING' || isPaused);

  return (
    <header className="widget-hud">
      <div className="hud-top-row">
        <div className="hud-stage-title">📍 {scoreData.currentZoneLabel || '중앙대 정문 ➔ 310관'}</div>
        <div className="hud-status-group">
          <div className="hud-timer">⏱️ {formattedTime}</div>
          <div className="hud-coins">
            <img src={iconChuruUrl} alt="츄르" className="hud-churu-icon" />
            {scoreData.coins}개
          </div>
          {showPauseButton && (
            <button
              type="button"
              className="hud-pause-btn"
              onClick={onTogglePause}
              title={isPaused ? '게임 재개 (ESC)' : '일시정지 (ESC)'}
              aria-label={isPaused ? '게임 재개' : '일시정지'}
            >
              <img
                src={isPaused ? btnPlayUrl : btnPauseUrl}
                alt={isPaused ? '재개' : '일시정지'}
                className="hud-pause-btn-img"
                draggable={false}
              />
            </button>
          )}
        </div>
      </div>

      {gameState !== 'CLEAR' && (
      <div className="hud-progress-container">
        <div className="hud-progress-labels">
          <span>정문</span>
          <span>{scoreData.distance}m / {scoreData.maxDistance}m ({scoreData.progressPercent}%)</span>
          <span>310관</span>
        </div>
        <div className="hud-progress-bar-bg" role="progressbar" aria-label="310관까지의 거리" aria-valuenow={scoreData.progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="hud-progress-bar-fill"
            style={{ width: `${scoreData.progressPercent}%` }}
          />
          <img src={catPortraitUrl} alt="" className="hud-progress-cat-icon" style={{ left: `${scoreData.progressPercent}%` }} />
        </div>
      </div>
      )}
    </header>
  );
};

