import React from 'react';
import './MobileDPad.css';
import dpadLeftUrl from '../../../assets/images/ui/dpad_left.png';
import dpadRightUrl from '../../../assets/images/ui/dpad_right.png';
import dpadUpUrl from '../../../assets/images/ui/dpad_up.png';
import dpadDownUrl from '../../../assets/images/ui/dpad_down.png';

interface DPadButtonProps {
  src: string;
  alt: string;
  className: string;
  onPressChange: (pressed: boolean) => void;
}

// 길게 누를 때 뜨는 복사/붙여넣기·이미지 저장 메뉴와 텍스트 선택을 막는다
const preventDefault = (e: React.SyntheticEvent) => e.preventDefault();

const DPadButton: React.FC<DPadButtonProps> = ({ src, alt, className, onPressChange }) => (
  <button
    type="button"
    className={`dpad-btn ${className}`}
    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onPressChange(true); }}
    onPointerUp={() => onPressChange(false)}
    onPointerCancel={() => onPressChange(false)}
    onLostPointerCapture={() => onPressChange(false)}
    onContextMenu={preventDefault}
    onDragStart={preventDefault}
    aria-label={alt}
  >
    <img src={src} alt={alt} className="dpad-img" draggable={false} />
  </button>
);

interface MobileDPadProps {
  onLeft: (pressed: boolean) => void;
  onRight: (pressed: boolean) => void;
  onUp: (pressed: boolean) => void;
  onDown: (pressed: boolean) => void;
}

export const MobileDPad: React.FC<MobileDPadProps> = ({ onLeft, onRight, onUp, onDown }) => {
  return (
    <>
      {/* 왼쪽: 좌우 이동 */}
      <div className="mobile-dpad-cluster mobile-dpad-steer" onContextMenu={preventDefault}>
        <DPadButton src={dpadLeftUrl} alt="좌" className="dpad-left" onPressChange={onLeft} />
        <DPadButton src={dpadRightUrl} alt="우" className="dpad-right" onPressChange={onRight} />
      </div>

      {/* 오른쪽: 가속(위) / 감속(아래) */}
      <div className="mobile-dpad-cluster mobile-dpad-speed" onContextMenu={preventDefault}>
        <DPadButton src={dpadUpUrl} alt="가속" className="dpad-up" onPressChange={onUp} />
        <DPadButton src={dpadDownUrl} alt="감속" className="dpad-down" onPressChange={onDown} />
      </div>
    </>
  );
};
