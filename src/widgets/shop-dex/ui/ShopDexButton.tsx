import { forwardRef, useId } from 'react';
import kitUrl from '../../../assets/images/shop-dex/shop_dex_kit.png';
import './ShopDex.css';

export const ShopDexButton = forwardRef<HTMLButtonElement, { onClick: () => void }>(
  ({ onClick }, ref) => {
    const clipId = useId();
    return (
      <button ref={ref} className="shop-dex-open" type="button" onClick={onClick} aria-label="가게 도감 열기">
        <svg viewBox="0 0 245 116" aria-hidden="true">
          <defs><clipPath id={clipId}><rect x="3" y="5" width="239" height="106" rx="50" /></clipPath></defs>
          <g clipPath={`url(#${clipId})`}>
            <svg width="245" height="116" viewBox="29 150 245 116" overflow="hidden">
              <image href={kitUrl} width="1024" height="765" />
            </svg>
          </g>
        </svg>
      </button>
    );
  }
);
