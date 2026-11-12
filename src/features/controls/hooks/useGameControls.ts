import { useEffect } from 'react';

interface UseGameControlsProps {
  onJump: () => void;
  onSlideStart: () => void;
  onSlideEnd: () => void;
  onStartOrRestart: () => void;
  isReadyOrGameOver: boolean;
}

export const useGameControls = ({
  onJump,
  onSlideStart,
  onSlideEnd,
  onStartOrRestart,
  isReadyOrGameOver,
}: UseGameControlsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        if (isReadyOrGameOver) {
          onStartOrRestart();
        } else {
          onJump();
        }
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        onSlideStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown') {
        onSlideEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onJump, onSlideStart, onSlideEnd, onStartOrRestart, isReadyOrGameOver]);
};
