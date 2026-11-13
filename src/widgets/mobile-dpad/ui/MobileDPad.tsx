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

const DPadButton: React.FC<DPadButtonProps> = ({ src, alt, className, onPressChange }) => (
  <button
    type="button"
    className={`dpad-btn ${className}`}
    onPointerDown={(e) => { e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); onPressChange(true); }}
    onPointerUp={() => onPressChange(false)}
    onPointerCancel={() => onPressChange(false)}
    onLostPointerCapture={() => onPressChange(false)}
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
    <div className="mobile-dpad-container">
      {/* Up */}
      <DPadButton
        src={dpadUpUrl}
        alt="위"
        className="dpad-up"
        onPressChange={onUp}
      />
      {/* Left */}
      <DPadButton
        src={dpadLeftUrl}
        alt="좌"
        className="dpad-left"
        onPressChange={onLeft}
      />
      {/* Right */}
      <DPadButton
        src={dpadRightUrl}
        alt="우"
        className="dpad-right"
        onPressChange={onRight}
      />
      {/* Down */}
      <DPadButton
        src={dpadDownUrl}
        alt="아래"
        className="dpad-down"
        onPressChange={onDown}
      />
    </div>
  );
};
