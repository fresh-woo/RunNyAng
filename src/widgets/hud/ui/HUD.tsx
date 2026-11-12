import React from 'react';
import { ScoreData } from '../../../shared/types';
import './HUD.css';

interface HUDProps {
  scoreData: ScoreData;
}

export const HUD: React.FC<HUDProps> = ({ scoreData }) => {
  return (
    <header className="widget-hud">
      <div className="hud-metric">
        <span className="hud-label">거리</span>
        <span className="hud-value">{scoreData.distance}m</span>
      </div>
      <div className="hud-metric">
        <span className="hud-label">코인</span>
        <span className="hud-value">🪙 {scoreData.coins}</span>
      </div>
      <div className="hud-metric">
        <span className="hud-label">최고기록</span>
        <span className="hud-value">{scoreData.highScore}m</span>
      </div>
    </header>
  );
};
