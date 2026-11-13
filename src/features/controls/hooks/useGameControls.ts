import { useEffect, useRef, useState, useCallback } from 'react';
import { MovementInput } from '../../../entities/player/model/physics';

interface UseGameControlsProps {
  onStartOrRestart: () => void;
  isReadyOrEnded: boolean;
}

export const useGameControls = ({
  onStartOrRestart,
  isReadyOrEnded,
}: UseGameControlsProps) => {
  const [movementInput, setMovementInput] = useState<MovementInput>({
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  });

  const inputRef = useRef<MovementInput>({
    moveLeft: false,
    moveRight: false,
    moveUp: false,
    moveDown: false,
  });

  const updateInput = useCallback((updater: (prev: MovementInput) => MovementInput) => {
    inputRef.current = updater(inputRef.current);
    setMovementInput({ ...inputRef.current });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'Enter') {
        if (isReadyOrEnded) {
          onStartOrRestart();
          return;
        }
      }

      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        e.preventDefault();
        updateInput((prev) => ({ ...prev, moveLeft: true }));
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        e.preventDefault();
        updateInput((prev) => ({ ...prev, moveRight: true }));
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        updateInput((prev) => ({ ...prev, moveUp: true }));
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        updateInput((prev) => ({ ...prev, moveDown: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        updateInput((prev) => ({ ...prev, moveLeft: false }));
      } else if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        updateInput((prev) => ({ ...prev, moveRight: false }));
      } else if (e.code === 'ArrowUp' || e.code === 'KeyW') {
        updateInput((prev) => ({ ...prev, moveUp: false }));
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        updateInput((prev) => ({ ...prev, moveDown: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onStartOrRestart, isReadyOrEnded, updateInput]);

  // Touch handler for mobile (touch left half to go left, touch right half to go right)
  const handleTouchStart = (clientX: number, windowWidth: number) => {
    if (isReadyOrEnded) {
      onStartOrRestart();
      return;
    }
    if (clientX < windowWidth / 2) {
      updateInput((prev) => ({ ...prev, moveLeft: true, moveRight: false }));
    } else {
      updateInput((prev) => ({ ...prev, moveRight: true, moveLeft: false }));
    }
  };

  const handleTouchEnd = () => {
    updateInput((prev) => ({ ...prev, moveLeft: false, moveRight: false }));
  };

  // Individual directional setters for D-PAD buttons
  const setMoveLeft = useCallback((pressed: boolean) => {
    updateInput((prev) => ({ ...prev, moveLeft: pressed, moveRight: pressed ? false : prev.moveRight }));
  }, [updateInput]);

  const setMoveRight = useCallback((pressed: boolean) => {
    updateInput((prev) => ({ ...prev, moveRight: pressed, moveLeft: pressed ? false : prev.moveLeft }));
  }, [updateInput]);

  const setMoveUp = useCallback((pressed: boolean) => {
    updateInput((prev) => ({ ...prev, moveUp: pressed }));
  }, [updateInput]);

  const setMoveDown = useCallback((pressed: boolean) => {
    updateInput((prev) => ({ ...prev, moveDown: pressed }));
  }, [updateInput]);

  return {
    movementInput: inputRef.current,
    stateMovementInput: movementInput,
    handleTouchStart,
    handleTouchEnd,
    setMoveLeft,
    setMoveRight,
    setMoveUp,
    setMoveDown,
  };
};
