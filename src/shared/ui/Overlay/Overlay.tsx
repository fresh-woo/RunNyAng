import React from 'react';
import './Overlay.css';

interface OverlayProps {
  children: React.ReactNode;
  className?: string;
}

export const Overlay: React.FC<OverlayProps> = ({ children, className = '' }) => {
  return <div className={`ui-overlay ${className}`}>{children}</div>;
};
