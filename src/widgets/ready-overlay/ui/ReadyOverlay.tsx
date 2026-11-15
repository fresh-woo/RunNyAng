import React, { useRef, useState } from 'react';
import { RankingBoard } from '../../ranking-board';
import { Overlay } from '../../../shared/ui/Overlay/Overlay';
import { Button } from '../../../shared/ui/Button/Button';
import catPortraitUrl from '../../../assets/images/cat/cat_portrait.png';
import { ShopDex, ShopDexButton } from '../../shop-dex';

interface ReadyOverlayProps {
  onStart: () => void;
}

export const ReadyOverlay: React.FC<ReadyOverlayProps> = ({ onStart }) => {
  const [showRanking, setShowRanking] = useState(false);
  const [showDex, setShowDex] = useState(false);
  const dexButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
    <Overlay>
      <ShopDexButton ref={dexButtonRef} onClick={() => setShowDex(true)} />
      <img
        src={catPortraitUrl}
        alt="냥이"
        style={{
          height: '110px',
          width: 'auto',
          marginBottom: '10px',
          imageRendering: 'pixelated',
          filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.5))',
        }}
        draggable={false}
      />
      <h1 style={{ fontSize: '2.1rem', marginBottom: '8px', color: '#38bdf8' }}>🐾 RunNyAng : 중앙대편</h1>
      <p style={{ color: '#e2e8f0', fontSize: '1.1rem', marginBottom: '8px', fontWeight: 600 }}>
        [Stage 1] 흑석역 ➔ 310관 (100주년 기념관)
      </p>
      <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '28px', maxWidth: '420px', lineHeight: 1.5 }}>
        흑석역에서 출발해 병원 앞 거리와 정문을 지나, 킥보드와 커피 웅덩이, 헐떡고개 장애물을 피해 310관 강의실까지 무사히 도착하세요!
      </p>
      <Button variant="start" onClick={onStart}>
        출발하기
      </Button>
      <Button variant="secondary" style={{ marginTop: '16px' }} onClick={() => setShowRanking(true)}>
        🏆 랭킹 보기
      </Button>
    </Overlay>
    {showRanking && <RankingBoard onClose={() => setShowRanking(false)} />}
    {showDex && <ShopDex onClose={() => { setShowDex(false); dexButtonRef.current?.focus(); }} />}
    </>
  );
};

