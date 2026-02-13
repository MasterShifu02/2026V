import { MouseEvent, useEffect, useRef, useState } from "react";
import { withBase } from "../../../content/basePath";
import { campAudioConfig } from "../content/campAudio";

type CampMissionProps = {
  recipientName: string;
  onBackToPortal: () => void;
  onMissionCompleted: () => void;
};

type ClickMarker = {
  id: number;
  x: number;
  y: number;
  isHit: boolean;
};

function isLeftThumbHit(normalizedX: number, normalizedY: number): boolean {
  return normalizedX >= 0.35 && normalizedX <= 0.38 && normalizedY >= 0.67 && normalizedY <= 0.71;
}

export function CampMission({
  recipientName,
  onBackToPortal,
  onMissionCompleted
}: CampMissionProps): JSX.Element {
  const [isSolved, setIsSolved] = useState(false);
  const [showRewardPopup, setShowRewardPopup] = useState(false);
  const [isReturningToPortal, setIsReturningToPortal] = useState(false);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [clickMarker, setClickMarker] = useState<ClickMarker | null>(null);
  const [markerId, setMarkerId] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const hitAudioRef = useRef<HTMLAudioElement | null>(null);
  const missAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);

  const getAudioContext = (): AudioContext | null => {
    const AudioContextCtor =
      window.AudioContext ??
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextCtor) {
      return null;
    }

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContextCtor();
    }

    if (audioContextRef.current.state === "suspended") {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playSyntheticFeedback = (tone: "hit" | "miss") => {
    const audioContext = getAudioContext();
    if (!audioContext) {
      return;
    }

    const now = audioContext.currentTime;

    if (tone === "miss") {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(160, now);
      oscillator.frequency.exponentialRampToValueAtTime(110, now + 0.14);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      oscillator.connect(gain);
      gain.connect(audioContext.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.14);
      return;
    }

    const lowOscillator = audioContext.createOscillator();
    const highOscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    lowOscillator.type = "sine";
    highOscillator.type = "triangle";
    lowOscillator.frequency.setValueAtTime(520, now);
    highOscillator.frequency.setValueAtTime(780, now + 0.1);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

    lowOscillator.connect(gain);
    highOscillator.connect(gain);
    gain.connect(audioContext.destination);

    lowOscillator.start(now);
    lowOscillator.stop(now + 0.18);
    highOscillator.start(now + 0.1);
    highOscillator.stop(now + 0.28);
  };

  const playFileFeedback = (tone: "hit" | "miss"): boolean => {
    const audio = tone === "hit" ? hitAudioRef.current : missAudioRef.current;
    if (!audio) {
      return false;
    }

    audio.currentTime = 0;
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        playSyntheticFeedback(tone);
      });
    }

    return true;
  };

  const playFeedbackSound = (tone: "hit" | "miss") => {
    const didPlayFile = playFileFeedback(tone);
    if (!didPlayFile) {
      playSyntheticFeedback(tone);
    }
  };

  useEffect(() => {
    hitAudioRef.current = new Audio(campAudioConfig.hitSoundPath);
    hitAudioRef.current.preload = "auto";
    missAudioRef.current = new Audio(campAudioConfig.missSoundPath);
    missAudioRef.current.preload = "auto";
    bgMusicAudioRef.current = new Audio(campAudioConfig.backgroundMusicPath);
    bgMusicAudioRef.current.preload = "auto";
    bgMusicAudioRef.current.loop = true;
    bgMusicAudioRef.current.volume = 0.42;

    const handleMusicCanPlay = () => {
      if (!bgMusicAudioRef.current) {
        return;
      }

      const autoplayPromise = bgMusicAudioRef.current.play();
      if (autoplayPromise) {
        autoplayPromise
          .then(() => {
            setIsMusicPlaying(true);
            setMusicNotice("Camp-musikk spiller.");
          })
          .catch(() => {
            setIsMusicPlaying(false);
            setMusicNotice("Trykk pa musikk-knappen for a starte Camp-musikk.");
          });
      }
    };

    const handleMusicError = () => {
      setIsMusicPlaying(false);
      setMusicNotice("Fant ikke Camp-musikken. Legg inn Camp.mp3.");
    };

    bgMusicAudioRef.current.addEventListener("canplay", handleMusicCanPlay, { once: true });
    bgMusicAudioRef.current.addEventListener("error", handleMusicError);

    return () => {
      if (hitAudioRef.current) {
        hitAudioRef.current.pause();
        hitAudioRef.current.src = "";
        hitAudioRef.current = null;
      }

      if (missAudioRef.current) {
        missAudioRef.current.pause();
        missAudioRef.current.src = "";
        missAudioRef.current = null;
      }

      if (bgMusicAudioRef.current) {
        bgMusicAudioRef.current.pause();
        bgMusicAudioRef.current.removeEventListener("canplay", handleMusicCanPlay);
        bgMusicAudioRef.current.removeEventListener("error", handleMusicError);
        bgMusicAudioRef.current.src = "";
        bgMusicAudioRef.current = null;
      }

      if (!audioContextRef.current) {
        return;
      }

      void audioContextRef.current.close();
      audioContextRef.current = null;
    };
  }, []);

  const handleMusicToggle = () => {
    if (!bgMusicAudioRef.current) {
      setMusicNotice("Fant ikke Camp-musikken. Legg inn Camp.mp3.");
      return;
    }

    if (isMusicPlaying) {
      bgMusicAudioRef.current.pause();
      setIsMusicPlaying(false);
      setMusicNotice("Camp-musikk pauset.");
      return;
    }

    const playPromise = bgMusicAudioRef.current.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true);
          setMusicNotice("Camp-musikk spiller.");
        })
        .catch(() => {
          setIsMusicPlaying(false);
          setMusicNotice("Trykk igjen for a starte Camp-musikk.");
        });
    }
  };

  const handleImageClick = (event: MouseEvent<HTMLImageElement>) => {
    if (isSolved) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const normalizedX = (event.clientX - bounds.left) / bounds.width;
    const normalizedY = (event.clientY - bounds.top) / bounds.height;
    const nextMarkerId = markerId + 1;
    setMarkerId(nextMarkerId);

    const isHit = isLeftThumbHit(normalizedX, normalizedY);
    setClickMarker({
      id: nextMarkerId,
      x: normalizedX * 100,
      y: normalizedY * 100,
      isHit
    });

    if (isHit) {
      playFeedbackSound("hit");
      setIsSolved(true);
      setShowRewardPopup(true);
      onMissionCompleted();
      return;
    }

    playFeedbackSound("miss");
    setWrongAttempts((previous) => previous + 1);
  };

  const handleTakeStoneToPortal = () => {
    if (isReturningToPortal) {
      return;
    }

    setShowRewardPopup(false);
    setIsReturningToPortal(true);

    window.setTimeout(() => {
      onBackToPortal();
    }, 1300);
  };

  return (
    <main className="camp-mission-page">
      <section className="camp-mission-shell">
        <p className="camp-mission__eyebrow">Camp Dossier // Esquie</p>
        <div className="camp-mission__music-row">
          <button type="button" className="camp-mission__music-button" onClick={handleMusicToggle}>
            {isMusicPlaying ? "Pause music" : "Play music"}
          </button>
          {musicNotice && <p className="camp-mission__music-status">{musicNotice}</p>}
        </div>
        <h1>Ryktene peker mot Esquie</h1>
        <p>
          {recipientName}, speidere fra Camp sier at Esquie har sett en glodende stein og gjemmer den i skyggene.
          Hvis du overbeviser Esquie, kan du sikre enda en stein til samlingen din.
        </p>

        <p className="camp-mission__goal">
          Oppdrag: Esquie er trist. Finn riktig sted a trykke pa Esquie for a kille ham sa han vil snakke.
        </p>
        <div className="camp-mission__statusbar">
          <span className={`camp-chip ${isSolved ? "is-success" : ""}`}>
            {isSolved ? "Stein sikret" : "Status: aktivt oppdrag"}
          </span>
          <span className="camp-chip">Forsok: {wrongAttempts}</span>
        </div>

        {!isSolved && (
          <p className="camp-mission__hint">
            {wrongAttempts === 0
              ? "Tips: Esquie ler bare nar du treffer et veldig spesifikt punkt."
              : `Ikke helt riktig... prov igjen. Forsok: ${wrongAttempts}`}
          </p>
        )}

        {isSolved && <p className="camp-mission__hint is-success">Riktig! Esquie begynner endelig a le.</p>}

        <figure className="camp-mission-figure">
          <div className="camp-mission-figure__hud">
            <span>Camp Sensor</span>
            <span>Esquie Mood: {isSolved ? "Glad" : "Trist"}</span>
          </div>
          <img
            src={withBase("/images/worlds/adi-expedition/Esquie.png")}
            alt="Esquie i Camp"
            loading="eager"
            onClick={handleImageClick}
          />
          {clickMarker && (
            <span
              key={clickMarker.id}
              className={`camp-click-marker ${clickMarker.isHit ? "is-hit" : "is-miss"}`}
              style={{
                left: `${clickMarker.x}%`,
                top: `${clickMarker.y}%`
              }}
              aria-hidden
            />
          )}
          <span className="camp-mission-figure__scanline" aria-hidden />
        </figure>

        <button
          type="button"
          className="camp-mission__back"
          onClick={onBackToPortal}
          disabled={isReturningToPortal}
        >
          Tilbake til portal-kartet
        </button>

        {showRewardPopup && (
          <div className="camp-reward-backdrop">
            <section
              className="camp-reward-popup"
              role="dialog"
              aria-modal="true"
              aria-label="Stein funnet"
            >
              <p className="camp-reward-popup__eyebrow">Oppdrag fullfort</p>
              <h2>Esquie stoler på deg</h2>
              <p>
                Esquie: "Du fikk meg til a le... ta denne steinen. Den er din nå :)."
              </p>
              <p className="camp-reward-popup__stone">Du mottok: Aether Stone</p>
              <button type="button" onClick={handleTakeStoneToPortal}>
                Ta steinen til portalen
              </button>
            </section>
          </div>
        )}

        {isReturningToPortal && (
          <div className="camp-return-sequence" aria-hidden>
            <div className="camp-return-sequence__stone" />
            <p className="camp-return-sequence__text">Aether Stone synkroniseres med portalen...</p>
          </div>
        )}
      </section>
    </main>
  );
}
