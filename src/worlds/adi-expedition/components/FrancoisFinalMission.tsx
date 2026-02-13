import { useEffect, useRef, useState } from "react";
import { withBase } from "../../../content/basePath";
import { missionAudioConfig } from "../content/missionAudio";

type FrancoisFinalMissionProps = {
  recipientName: string;
  onMissionCompleted: () => void;
};

const FRANCOIS_IMAGE_CANDIDATES = [
  withBase("/images/worlds/adi-expedition/Francois.jpeg"),
  withBase("/images/worlds/adi-expedition/francois.jpeg"),
  withBase("/images/worlds/adi-expedition/Francois.jpg"),
  withBase("/images/worlds/adi-expedition/francois.jpg"),
  withBase("/images/worlds/adi-expedition/Francois.png"),
  withBase("/images/worlds/adi-expedition/francois.png"),
  withBase("/images/worlds/adi-expedition/Francois.webp"),
  withBase("/images/worlds/adi-expedition/francois.webp")
] as const;

export function FrancoisFinalMission({
  recipientName,
  onMissionCompleted
}: FrancoisFinalMissionProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [isDeliveringStones, setIsDeliveringStones] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const imageSource = FRANCOIS_IMAGE_CANDIDATES[imageIndex] ?? null;
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);

  const handleDeliverStones = () => {
    if (isDeliveringStones) {
      return;
    }

    setIsDeliveringStones(true);
    window.setTimeout(() => {
      onMissionCompleted();
    }, 900);
  };

  const handleImageError = () => {
    setImageIndex((previous) => previous + 1);
  };

  const handleMusicToggle = () => {
    if (!bgMusicAudioRef.current) {
      setMusicNotice("Fant ikke felles oppdragsmusikk. Legg inn Vault-Throne.mp3.");
      return;
    }

    if (isMusicPlaying) {
      bgMusicAudioRef.current.pause();
      setIsMusicPlaying(false);
      setMusicNotice("Musikk pauset.");
      return;
    }

    const playPromise = bgMusicAudioRef.current.play();
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
    const bgMusic = new Audio(missionAudioConfig.sharedMusicPath);
    bgMusic.preload = "auto";
    bgMusic.loop = true;
    bgMusic.volume = 0.44;
    bgMusicAudioRef.current = bgMusic;

    const handleCanPlay = () => {
      const autoplayPromise = bgMusic.play();
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
      setMusicNotice("Fant ikke felles oppdragsmusikk. Legg inn Vault-Throne.mp3.");
    };

    bgMusic.addEventListener("canplay", handleCanPlay, { once: true });
    bgMusic.addEventListener("error", handleError);

    return () => {
      bgMusic.pause();
      bgMusic.removeEventListener("canplay", handleCanPlay);
      bgMusic.removeEventListener("error", handleError);
      bgMusic.src = "";
      bgMusicAudioRef.current = null;
    };
  }, []);

  return (
    <main className="francois-final-page">
      <section className="francois-final-shell">
        <p className="francois-final__eyebrow">Sluttoppdrag // Francois Throne</p>
        <div className="francois-final__music-row">
          <button type="button" className="francois-final__music-button" onClick={handleMusicToggle}>
            {isMusicPlaying ? "Pause music" : "Play music"}
          </button>
          {musicNotice && <p className="francois-final__music-status">{musicNotice}</p>}
        </div>
        <h1>Francois venter ved den siste porten</h1>
        <figure className="francois-final-portrait">
          {imageSource ? (
            <img
              src={imageSource}
              alt="Francois ved Rift Citadel"
              loading="eager"
              onError={handleImageError}
            />
          ) : (
            <div className="francois-final-portrait__missing">
              <p>Fant ikke Francois-bildet.</p>
              <p>Legg filen i `public/images/worlds/adi-expedition/`.</p>
            </div>
          )}
        </figure>
        <p>
          {recipientName}, du star foran Francois med tre steiner i hendene. Han holder Adi fanget i
          rift-tronen og krever at du overleverer alt.
        </p>

        <p>Overlever steinene for a tvinge fram avtalen og fa Adi fri.</p>
        <button type="button" className="francois-final__action" onClick={handleDeliverStones} disabled={isDeliveringStones}>
          {isDeliveringStones ? "Francois godtar steinene..." : "Overlever de tre steinene"}
        </button>
      </section>
    </main>
  );
}
