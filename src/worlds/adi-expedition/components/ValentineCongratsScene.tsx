import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { valentineAudioConfig } from "../content/valentineAudio";

type ValentineCongratsSceneProps = {
  recipientName: string;
  onBackToPortal: () => void;
};

const ADI_IMAGE_CANDIDATES = [
  "/images/worlds/adi-expedition/Adi.jpeg",
  "/images/worlds/adi-expedition/adi.jpeg",
  "/images/worlds/adi-expedition/Adi.jpg",
  "/images/worlds/adi-expedition/adi.jpg",
  "/images/worlds/adi-expedition/Adi.png",
  "/images/worlds/adi-expedition/adi.png",
  "/images/worlds/adi-expedition/Adi.webp",
  "/images/worlds/adi-expedition/adi.webp",
  "/images/worlds/adi-expedition/Me.jpeg",
  "/images/worlds/adi-expedition/me.jpeg",
  "/images/worlds/adi-expedition/Me.jpg",
  "/images/worlds/adi-expedition/me.jpg",
  "/images/worlds/adi-expedition/Me.png",
  "/images/worlds/adi-expedition/me.png"
] as const;

export function ValentineCongratsScene({
  recipientName,
  onBackToPortal
}: ValentineCongratsSceneProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [isPortraitMagic, setIsPortraitMagic] = useState(false);
  const [isCardOpened, setIsCardOpened] = useState(false);
  const [isBlooming, setIsBlooming] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const imageSource = ADI_IMAGE_CANDIDATES[imageIndex] ?? null;
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);

  const heartParticles = Array.from({ length: 16 }, (_, index) => ({
    id: `heart-${index}`,
    style: {
      "--heart-left": `${6 + index * 6}%`,
      "--heart-delay": `${(index % 7) * 0.7}s`,
      "--heart-duration": `${10 + (index % 5) * 2}s`,
      "--heart-size": `${10 + (index % 4) * 4}px`
    } as CSSProperties
  }));

  const sparkParticles = Array.from({ length: 20 }, (_, index) => ({
    id: `spark-${index}`,
    style: {
      "--spark-left": `${4 + index * 4.7}%`,
      "--spark-top": `${8 + (index % 6) * 14}%`,
      "--spark-delay": `${(index % 8) * 0.35}s`
    } as CSSProperties
  }));

  const flowerRain = Array.from({ length: 44 }, (_, index) => ({
    id: `flower-rain-${index}`,
    style: {
      "--flower-left": `${2 + (index % 22) * 4.5}%`,
      "--flower-delay": `${(index % 11) * 0.22}s`,
      "--flower-duration": `${5.8 + (index % 6) * 0.75}s`,
      "--flower-size": `${10 + (index % 5) * 4}px`,
      "--flower-tilt": `${-20 + (index % 9) * 5}deg`
    } as CSSProperties
  }));

  const portraitBursts = Array.from({ length: 18 }, (_, index) => ({
    id: `portrait-burst-${index}`,
    style: {
      "--portrait-petal-left": `${6 + (index % 6) * 16}%`,
      "--portrait-petal-delay": `${(index % 9) * 0.12}s`,
      "--portrait-petal-duration": `${2.6 + (index % 4) * 0.3}s`,
      "--portrait-petal-size": `${8 + (index % 5) * 3}px`,
      "--portrait-petal-drift": `${-28 + (index % 8) * 8}px`
    } as CSSProperties
  }));

  const handleImageError = () => {
    setImageIndex((previous) => previous + 1);
  };

  const handleTogglePortraitMagic = () => {
    setIsPortraitMagic((previous) => !previous);
  };

  const handleStartBloom = () => {
    if (isBlooming) {
      return;
    }

    setIsCardOpened(true);
    setIsBlooming(true);
  };

  const handleMusicToggle = () => {
    const audio = musicAudioRef.current;
    if (!audio) {
      setMusicNotice("Fant ikke valentins-musikken. Legg inn theme.mp3.");
      return;
    }

    if (isMusicPlaying) {
      audio.pause();
      setIsMusicPlaying(false);
      setMusicNotice("Musikk pauset.");
      return;
    }

    const playPromise = audio.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true);
          setMusicNotice("Musikk spiller.");
        })
        .catch(() => {
          setIsMusicPlaying(false);
          setMusicNotice("Trykk igjen for a starte musikken.");
        });
    }
  };

  useEffect(() => {
    const audio = new Audio(valentineAudioConfig.themePath);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = 0.55;
    musicAudioRef.current = audio;

    const handleCanPlay = () => {
      const autoplayPromise = audio.play();
      if (autoplayPromise) {
        autoplayPromise
          .then(() => {
            setIsMusicPlaying(true);
            setMusicNotice("Musikk spiller.");
          })
          .catch(() => {
            setIsMusicPlaying(false);
            setMusicNotice("Trykk pa musikk-knappen for a starte.");
          });
      }
    };

    const handleError = () => {
      setIsMusicPlaying(false);
      setMusicNotice("Fant ikke valentins-musikken. Legg inn theme.mp3.");
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });
    audio.addEventListener("error", handleError);

    return () => {
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.src = "";
      musicAudioRef.current = null;
    };
  }, []);

  return (
    <main className={`valentine-congrats-page ${isBlooming ? "is-blooming" : ""}`}>
      <div className="valentine-cosmos" aria-hidden>
        {heartParticles.map((particle) => (
          <span key={particle.id} className="valentine-cosmos__heart" style={particle.style} />
        ))}
        {sparkParticles.map((particle) => (
          <span key={particle.id} className="valentine-cosmos__spark" style={particle.style} />
        ))}
      </div>

      {isBlooming && (
        <div className="valentine-flower-rain" aria-hidden>
          {flowerRain.map((flower) => (
            <span key={flower.id} style={flower.style} />
          ))}
        </div>
      )}

      <section className="valentine-congrats-shell">
        <p className="valentine-congrats__eyebrow">Valentinsdagen // Sluttmelding</p>
        <button type="button" className="valentine-music-control" onClick={handleMusicToggle}>
          {isMusicPlaying ? "Pause music" : "Play music"}
        </button>
        {musicNotice && <p className="valentine-music-status">{musicNotice}</p>}
        <h1>Miluju te kjære</h1>

        <div className="valentine-congrats-layout">
          <figure className={`valentine-congrats-portrait ${isPortraitMagic ? "is-magic" : ""}`}>
            {imageSource ? (
              <>
                <img
                  src={imageSource}
                  alt="Adi sender en varm valentins-hilsen"
                  loading="eager"
                  onError={handleImageError}
                />
                <button
                  type="button"
                  className="valentine-portrait-magic-button"
                  onClick={handleTogglePortraitMagic}
                >
                  {isPortraitMagic ? "Calm magic" : "Magic photo"}
                </button>
                {isPortraitMagic && (
                  <div className="valentine-portrait-burst" aria-hidden>
                    {portraitBursts.map((petal) => (
                      <span key={petal.id} style={petal.style} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="valentine-congrats-portrait__missing">
                <p>Fant ikke bildet av Adi.</p>
                <p>Legg bildet i `public/images/worlds/adi-expedition/`.</p>
              </div>
            )}
          </figure>

          <section className="valentine-card-stage">
            <button
              type="button"
              className="valentine-card-open-button"
              onClick={handleStartBloom}
              disabled={isBlooming}
            >
              {isBlooming ? "Kortet er apnet" : "Apne blomsterbrevet"}
            </button>

            <div className={`valentine-envelope ${isCardOpened ? "is-opened" : ""}`} aria-live="polite">
              <span className="valentine-envelope__glow" aria-hidden />
              <span className="valentine-envelope__flap" aria-hidden />
              <div className="valentine-envelope__body">
                <section className="valentine-message-card">
                  <p className="valentine-message-card__line">
                    Happy Valentine {recipientName} Being with you feels like home. Thank you for the way you care, the way you laugh, and the way you make normal days feel special, just like you. I love you more than I can fit into this card, and this is basicaly infinite, but I’ll spend every day trying to show you. I hope you liked the litle Valentine game I made for you, with eventualy more planets for you to explore soon. Jeg elsker deg!
                  </p>
                </section>
              </div>
            </div>

            {isBlooming && (
              <div className="valentine-bloom-reveal">
                <div className="valentine-flowers valentine-flowers--bouquet is-blooming" aria-hidden>
                  <span />
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
          </section>
        </div>

        {isBlooming && (
          <div className="valentine-fireworks is-active" aria-hidden>
            <span />
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        )}

        <button type="button" className="valentine-congrats__back" onClick={onBackToPortal}>
          Tilbake til portal-kartet
        </button>
      </section>
    </main>
  );
}
