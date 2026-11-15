import React from 'react';
import './Button.css';
import btnStartUrl from '../../../assets/images/ui/btn_start.png';
import btnRetryUrl from '../../../assets/images/ui/btn_retry.png';
import btnPauseUrl from '../../../assets/images/ui/btn_pause.png';
import btnPlayUrl from '../../../assets/images/ui/btn_play.png';
import btnExitUrl from '../../../assets/images/ui/btn_exit_clean.png';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'start' | 'retry' | 'pause' | 'play' | 'exit';
  children?: React.ReactNode;
}

const PIXEL_BUTTON_MAP: Partial<Record<string, string>> = {
  start: btnStartUrl,
  retry: btnRetryUrl,
  pause: btnPauseUrl,
  play: btnPlayUrl,
  exit: btnExitUrl,
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const pixelSrc = PIXEL_BUTTON_MAP[variant];

  if (pixelSrc) {
    return (
      <button className={`btn btn-pixel ${className}`} {...props}>
        <img
          src={pixelSrc}
          alt={String(children ?? variant)}
          className="btn-pixel-img"
          draggable={false}
        />
      </button>
    );
  }

  return (
    <button className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
};

