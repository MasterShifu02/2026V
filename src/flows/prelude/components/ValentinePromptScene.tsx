import { useEffect, useRef, useState } from "react";
import { withBase } from "../../../content/basePath";
import { valentinePromptAudioConfig } from "../content/valentinePromptAudio";

type ValentinePromptSceneProps = {
  recipientName: string;
  onStartRealExperience: () => void;
};

const BEAR_IMAGE_CANDIDATES = [
  withBase("/images/opening/Valentine-bear.png"),
  withBase("/images/opening/valentine-bear.png"),
  withBase("/images/valentine-bear.png")
] as const;

const NO_REACTIONS = [
  "Hmm... prov en gang til.",
  "No-knappen blir svakere...",
  "Universet peker mot \"Yes\".",
  "Dette blir mistenkelig romantisk.",
  "Okay, nesten ingen kraft igjen i \"No\"."
] as const;

type VoiceState = "idle" | "playing" | "ended" | "missing" | "blocked";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function ValentinePromptScene({
  recipientName,
  onStartRealExperience
}: ValentinePromptSceneProps): JSX.Element {
  const transitionTimeoutRef = useRef<number | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const [noCount, setNoCount] = useState(0);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [showFinalQuestion, setShowFinalQuestion] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const imageSource = BEAR_IMAGE_CANDIDATES[imageIndex] ?? null;
  const noScale = clamp(1 - noCount * 0.14, 0.35, 1);
  const yesScale = clamp(1 + noCount * 0.12, 1, 1.85);
  const noReaction = noCount === 0 ? null : NO_REACTIONS[Math.min(noCount - 1, NO_REACTIONS.length - 1)];

  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }

      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
        voiceAudioRef.current.src = "";
        voiceAudioRef.current = null;
      }
    };
  }, []);

  const handleNoClick = () => {
    if (showFinalQuestion || voiceState === "playing") {
      return;
    }

    setNoCount((previous) => previous + 1);
  };

  const handleVoicePlay = () => {
    if (voiceState === "playing") {
      return;
    }

    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.src = "";
      voiceAudioRef.current = null;
    }

    const audio = new Audio(valentinePromptAudioConfig.voiceLinePath);
    audio.preload = "auto";
    audio.volume = valentinePromptAudioConfig.voiceLineVolume;
    voiceAudioRef.current = audio;
    setVoiceState("playing");
    setShowFinalQuestion(false);

    audio.addEventListener(
      "ended",
      () => {
        setVoiceState("ended");
        setShowFinalQuestion(true);
      },
      { once: true }
    );

    audio.addEventListener(
      "error",
      () => {
        setVoiceState("missing");
        setShowFinalQuestion(true);
      },
      { once: true }
    );

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        setVoiceState("blocked");
        setShowFinalQuestion(true);
      });
    }
  };

  const handleYesClick = () => {
    if (showFinalQuestion) {
      return;
    }

    handleVoicePlay();
  };

  const handleImageError = () => {
    setImageIndex((previous) => previous + 1);
  };

  const handleStartExperience = () => {
    if (isTransitioning) {
      return;
    }

    setIsTransitioning(true);
    transitionTimeoutRef.current = window.setTimeout(() => {
      onStartRealExperience();
      transitionTimeoutRef.current = null;
    }, 1200);
  };

  return (
    <main className={`valentine-prompt-page ${isTransitioning ? "is-transitioning" : ""}`}>
      <div className="valentine-prompt-hearts" aria-hidden />
      <div className={`prelude-space-tear ${isTransitioning ? "is-active" : ""}`} aria-hidden>
        <span className="prelude-space-tear__line" />
        <span className="prelude-space-tear__core" />
        <span className="prelude-space-tear__void" />
      </div>
      <section className="valentine-prompt-card">
        <figure className="valentine-prompt-figure">
          {imageSource ? (
            <img src={imageSource} alt="Valentine forhandskort" loading="eager" onError={handleImageError} />
          ) : (
            <div className="valentine-prompt-figure__missing">
              <p>Legg til bildet i:</p>
              <p>`public/images/opening/Valentine-bear.png`</p>
            </div>
          )}
        </figure>

        {!showFinalQuestion ? (
          <>
            <h1>Will you be my Valentine?</h1>
            <div className="valentine-prompt-actions">
              <button
                type="button"
                className="valentine-prompt-button is-yes"
                style={{ transform: `scale(${yesScale})` }}
                onClick={handleYesClick}
              >
                Yes
              </button>
              <button
                type="button"
                className="valentine-prompt-button is-no"
                style={{ transform: `scale(${noScale})` }}
                onClick={handleNoClick}
                disabled={voiceState === "playing"}
              >
                No
              </button>
            </div>
            {noReaction && <p className="valentine-prompt-note">{noReaction}</p>}
            {voiceState === "playing" && (
              <p className="valentine-prompt-note">Spiller stemme...</p>
            )}
          </>
        ) : (
          <>
            <h1>{recipientName}, vil du bli med pa den ekte Valentine experience?</h1>
            <p className="valentine-prompt-note">
              {voiceState === "missing"
                ? "Fant ikke stemmefilen ennå. Legg den til, sa spiller den her automatisk."
                : voiceState === "blocked"
                  ? "Nettleseren blokkerte lyd. Vi kan fortsatt fortsette."
                  : "Stemmen er ferdig. Klar for den ekte reisen?"}
            </p>
            <div className="valentine-prompt-confirm">
              <button
                type="button"
                className="valentine-prompt-button is-start"
                onClick={handleStartExperience}
                disabled={isTransitioning}
              >
                Start ekte Valentine experience
              </button>
              <button
                type="button"
                className="valentine-prompt-replay"
                onClick={handleVoicePlay}
                disabled={isTransitioning}
              >
                Spill stemmen igjen
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
