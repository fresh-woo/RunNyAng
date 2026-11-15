import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import prologueUrl from "../../../assets/images/story/prologue.png";
import catPortraitUrl from "../../../assets/images/cat/cat_portrait.png";
import { storyScenes } from "../model/storyScenes";
import "./StoryCutscene.css";

interface StoryCutsceneProps {
  onComplete: () => void;
}

const FADE_DURATION_MS = 3000;
type TransitionPhase = "loading" | "fading-out" | "fading-in" | "dialogue-in" | "ready";

export const StoryCutscene = ({ onComplete }: StoryCutsceneProps) => {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [phase, setPhase] = useState<TransitionPhase>("loading");
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [dialogueIndex, setDialogueIndex] = useState<number | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const transitioningRef = useRef(true);
  const completedRef = useRef(false);
  const scene = storyScenes[sceneIndex];
  const isLastScene = sceneIndex === storyScenes.length - 1;
  const isTransitioning = phase !== "ready";
  const isDialogueHidden = phase === "loading" || phase === "fading-in";
  const dialogueScene = dialogueIndex === null ? scene : storyScenes[dialogueIndex];

  useEffect(() => {
    sectionRef.current?.focus();
    let cancelled = false;
    const image = new Image();
    image.src = prologueUrl;
    // 첫 컷도 이미지 디코딩이 끝난 뒤 페이드를 시작한다.
    image.decode().catch(() => undefined).then(() => {
      if (!cancelled) setPhase("fading-in");
    });
    return () => { cancelled = true; };
  }, []);

  const finishImageTransition = () => {
    if (completedRef.current) return;
    if (phase === "fading-out") {
      completedRef.current = true;
      onComplete();
    } else if (phase === "fading-in") {
      setPreviousIndex(null);
      setDialogueIndex(sceneIndex);
      setPhase("dialogue-in");
    }
  };

  const navigate = (direction: -1 | 1) => {
    if (transitioningRef.current || completedRef.current) return;
    const targetIndex = sceneIndex + direction;
    if (targetIndex < 0) return;
    transitioningRef.current = true;
    sectionRef.current?.focus();
    if (targetIndex === storyScenes.length) {
      setPhase("fading-out");
    } else {
      setPreviousIndex(sceneIndex);
      setSceneIndex(targetIndex);
      setPhase("fading-in");
    }
  };

  return (
    <section
      ref={sectionRef}
      tabIndex={-1}
      className="story-cutscene"
      style={
        {
          "--story-image-fade-duration": `${FADE_DURATION_MS}ms`,
        } as CSSProperties
      }
      aria-label="중냥이의 프롤로그"
      aria-busy={isTransitioning}
      onKeyDown={(event) => {
        if (event.code !== "Enter" && event.code !== "Escape") return;
        event.preventDefault();
        event.stopPropagation();
        if (!event.repeat) navigate(event.code === "Escape" ? -1 : 1);
      }}
    >
      <header className="story-heading">
        <h2>{scene.title}</h2>
        <span aria-label={`${storyScenes.length}컷 중 ${sceneIndex + 1}컷`}>
          {sceneIndex + 1} / {storyScenes.length}
        </span>
      </header>

      <div className="story-visual">
        {storyScenes.map((panel, index) => (
          <svg
            key={panel.viewBox}
            className={`story-panel${index === sceneIndex ? ` story-panel--active story-panel--${phase}` : index === previousIndex ? " story-panel--outgoing" : ""}`}
            viewBox="0 0 509 379"
            role="img"
            aria-label={panel.imageDescription}
            aria-hidden={index !== sceneIndex}
            onAnimationEnd={(event) => {
              if (event.target === event.currentTarget && index === sceneIndex) {
                finishImageTransition();
              }
            }}
          >
            <svg width="509" height="379" viewBox={panel.viewBox} overflow="hidden">
              <image href={prologueUrl} width="1024" height="765" />
            </svg>
          </svg>
        ))}
      </div>

      <div
        className={`story-dialogue story-dialogue--${phase}${dialogueIndex === null ? " story-dialogue--unread" : ""}`}
        onAnimationEnd={(event) => {
          if (event.target === event.currentTarget && phase === "dialogue-in") {
            transitioningRef.current = false;
            setPhase("ready");
          }
        }}
      >
        <div className="story-speaker" aria-hidden={isDialogueHidden}>
          <img src={catPortraitUrl} alt="" draggable={false} />
          <span>{dialogueScene.speaker}</span>
        </div>
        <div
          className="story-lines"
          aria-live="polite"
          aria-atomic="true"
          aria-hidden={isDialogueHidden}
        >
          {storyScenes.map((line, index) => (
            <div key={line.viewBox} className={`story-line-panel${index === dialogueIndex ? " story-line-panel--active" : ""}`} aria-hidden={index !== dialogueIndex}>
              <p className="story-speech">{line.dialogue}</p>
              {line.narration && <p className="story-narration">{line.narration}</p>}
              {line.effect && <p className="story-effect">{line.effect}</p>}
            </div>
          ))}
        </div>
        <footer className="story-actions">
          <button
            type="button"
            className="story-previous"
            onClick={() => navigate(-1)}
            disabled={sceneIndex === 0 || isTransitioning}
          >
            <span
              aria-hidden="true"
              className="story-next-arrow story-next-arrow--previous"
            />
            이전
          </button>
          <span className="story-key-hint">Enter 다음 · ESC 이전</span>
          <button
            type="button"
            onClick={() => navigate(1)}
            disabled={isTransitioning}
          >
            {isLastScene ? "난이도 선택" : "다음 이야기"}
            <span aria-hidden="true" className="story-next-arrow" />
          </button>
        </footer>
      </div>
    </section>
  );
};
