import React from 'react';
import { ScoreData } from '../../../shared/types';
import './HUD.css';

interface HUDProps {
  scoreData: ScoreData;
}

export const HUD: React.FC<HUDProps> = ({ scoreData }) => {
  const minutes = Math.floor(scoreData.elapsedSeconds / 60);
  const remainingSeconds = (scoreData.elapsedSeconds % 60).toFixed(1);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${remainingSeconds.padStart(4, '0')}`;

  return (
    <header className="widget-hud">
      <div className="hud-top-row">
        <div className="hud-stage-title">📍 중앙대 정문 ➔ 310관 (100주년)</div>
        <div className="hud-status-group">
          <div className="hud-timer">⏱️ {formattedTime}</div>
          <div className="hud-coins">🐟 츄르: {scoreData.coins}개</div>
        </div>
      </div>

      <div className="hud-progress-container">
        <div className="hud-progress-labels">
          <span>정문 (0m)</span>
          <span>{scoreData.distance}m / {scoreData.maxDistance}m ({scoreData.progressPercent}%)</span>
          <span>310관 도착</span>
        </div>
        <div className="hud-progress-bar-bg">
          <div
            className="hud-progress-bar-fill"
            style={{ width: `${scoreData.progressPercent}%` }}
          />
          <div
            className="hud-progress-cat-icon"
            style={{ left: `calc(${scoreData.progressPercent}% - 10px)` }}
          >
            🐾
          </div>
        </div>
      </div>
    </header>
  );
};

