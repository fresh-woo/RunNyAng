import React from 'react';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import btnPlayUrl from '../../../assets/images/ui/btn_play.png';
import { Button } from '../../../shared/ui/Button/Button';
import './PauseOverlay.css';

interface PauseOverlayProps {
  onResume: () => void;
  onReturnToStart: () => void;
}

export const PauseOverlay: React.FC<PauseOverlayProps> = ({ onResume, onReturnToStart }) => {
  return (
    <Overlay>
      <div className="pause-overlay-content">
        <h2 className="pause-title">⏸️ 일시정지</h2>
        <p className="pause-desc">달리기를 잠시 멈췄습니다.</p>

        <div className="pause-btn-wrap">
          <button
            type="button"
            className="pause-play-btn"
            onClick={onResume}
            title="게임 재개 (ESC)"
            aria-label="게임 재개"
          >
            <img
              src={btnPlayUrl}
              alt="게임 재개"
              className="pause-play-btn-img"
              draggable={false}
            />
          </button>
          <span className="pause-key-hint">재개 버튼을 누르거나 [ESC]를 누르면 계속 달립니다</span>
          <Button type="button" variant="exit" className="pause-return-btn" onClick={onReturnToStart} title="처음 화면으로 돌아가기">
            처음으로 돌아가기
          </Button>
        </div>
      </div>
    </Overlay>
  );
};
