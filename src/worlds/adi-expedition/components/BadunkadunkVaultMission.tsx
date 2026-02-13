import { useEffect, useMemo, useRef, useState } from "react";
import { withBase } from "../../../content/basePath";
import { missionAudioConfig } from "../content/missionAudio";
import { vaultAudioConfig } from "../content/vaultAudio";
import { vaultDialogue } from "../content/vaultDialogue";

type BadunkadunkVaultMissionProps = {
  recipientName: string;
  onBackToPortal: () => void;
};

const NEVRON_IMAGE_CANDIDATES = [
  withBase("/images/worlds/adi-expedition/Nevron.png"),
  withBase("/images/worlds/adi-expedition/nevron.png"),
  withBase("/images/worlds/adi-expedition/Nevron.webp"),
  withBase("/images/worlds/adi-expedition/nevron.webp"),
  withBase("/images/worlds/adi-expedition/Nevron.jpg"),
  withBase("/images/worlds/adi-expedition/nevron.jpg")
] as const;

type DialoguePhase =
  | "idle"
  | "firstLinePlaying"
  | "awaitingAniReply"
  | "finalLinePlaying"
  | "completed";

type FinalPlaybackMode = "initial" | "replay";

export function BadunkadunkVaultMission({
  recipientName,
  onBackToPortal
}: BadunkadunkVaultMissionProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [showChoicePopup, setShowChoicePopup] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [talkCount, setTalkCount] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const [dialoguePhase, setDialoguePhase] = useState<DialoguePhase>("idle");
  const [finalReplayCount, setFinalReplayCount] = useState(0);
  const firstLineAudioRef = useRef<HTMLAudioElement | null>(null);
  const finalLineAudioRef = useRef<HTMLAudioElement | null>(null);
  const bgMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const finalPlaybackModeRef = useRef<FinalPlaybackMode>("initial");
  const finalLineStartDelayRef = useRef<number | null>(null);
  const imageSource = useMemo(() => NEVRON_IMAGE_CANDIDATES[imageIndex] ?? null, [imageIndex]);
  const isTalking = dialoguePhase === "firstLinePlaying" || dialoguePhase === "finalLinePlaying";
  const canReplyAsAni = dialoguePhase === "awaitingAniReply";
  const canReplayFinalLine = dialoguePhase === "completed";

  const startFinalLine = (mode: FinalPlaybackMode) => {
    const finalAudio = finalLineAudioRef.current;
    if (!finalAudio) {
      setActionMessage("Nevron sin siste lyd mangler. Legg inn nevron2.mp3.");
      return;
    }

    finalPlaybackModeRef.current = mode;
    setDialoguePhase("finalLinePlaying");
    setActionMessage(
      mode === "initial"
        ? `Nevron:\n${vaultDialogue.finalLine}`
        : `Nevron (siste replikk, igjen):\n${vaultDialogue.finalLine}`
    );
    finalAudio.currentTime = 0;
    const playPromise = finalAudio.play();

    if (playPromise) {
      playPromise.catch(() => {
        if (mode === "replay") {
          setDialoguePhase("completed");
          setActionMessage("Kunne ikke spille siste replikk pa nytt akkurat na.");
          return;
        }

        setDialoguePhase("awaitingAniReply");
        setActionMessage("Kunne ikke spille siste replikk. Sjekk nevron2.mp3.");
      });
    }
  };

  const startFirstLine = () => {
    const firstAudio = firstLineAudioRef.current;
    if (!firstAudio) {
      setActionMessage("Nevron sin forste lyd mangler. Legg inn nevron1.mp3.");
      return;
    }

    setDialoguePhase("firstLinePlaying");
    setActionMessage(`Nevron:\n${vaultDialogue.firstLine}`);
    setTalkCount((previous) => previous + 1);
    firstAudio.currentTime = 0;
    const playPromise = firstAudio.play();

    if (playPromise) {
      playPromise.catch(() => {
        setDialoguePhase("idle");
        setActionMessage("Kunne ikke spille forste replikk. Sjekk nevron1.mp3.");
      });
    }
  };

  const handleImageError = () => {
    setImageIndex((previous) => previous + 1);
  };

  const handleImageClick = () => {
    if (!imageSource) {
      return;
    }

    setShowChoicePopup(true);
  };

  const handleKillChoice = () => {
    setShowChoicePopup(false);
    setActionMessage("Nei, du kan ikke drepe Nevron.");
  };

  const handleTalkChoice = () => {
    setShowChoicePopup(false);

    if (dialoguePhase === "firstLinePlaying" || dialoguePhase === "finalLinePlaying") {
      setActionMessage("Vent til Nevron er ferdig med a snakke.");
      return;
    }

    if (dialoguePhase === "awaitingAniReply") {
      setActionMessage("Ani ma svare for Nevron kan fortsette.");
      return;
    }

    if (dialoguePhase === "completed") {
      startFinalLine("replay");
      return;
    }

    startFirstLine();
  };

  const handleAniReply = () => {
    if (dialoguePhase !== "awaitingAniReply") {
      return;
    }

    setActionMessage(`${recipientName}: ${vaultDialogue.aniReply}`);

    if (finalLineStartDelayRef.current !== null) {
      window.clearTimeout(finalLineStartDelayRef.current);
    }

    finalLineStartDelayRef.current = window.setTimeout(() => {
      startFinalLine("initial");
      finalLineStartDelayRef.current = null;
    }, 450);
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

  useEffect(() => {
    const firstAudio = new Audio(vaultAudioConfig.firstLinePath);
    firstAudio.preload = "auto";
    firstLineAudioRef.current = firstAudio;

    const finalAudio = new Audio(vaultAudioConfig.finalLinePath);
    finalAudio.preload = "auto";
    finalLineAudioRef.current = finalAudio;

    const handleFirstLineEnded = () => {
      setDialoguePhase("awaitingAniReply");
      setActionMessage("Ani, svar Nevron enkelt for han fortsetter.");
    };

    const handleFirstLineError = () => {
      setDialoguePhase("idle");
      setActionMessage("Kunne ikke laste forste replikk. Sjekk nevron1.mp3.");
    };

    const handleFinalLineEnded = () => {
      setDialoguePhase("completed");

      if (finalPlaybackModeRef.current === "replay") {
        setFinalReplayCount((previous) => previous + 1);
        setActionMessage("Nevron gjentok siste replikk. Du kan spille den igjen.");
        return;
      }

      setActionMessage("Nevron er ferdig. Siste replikk kan spilles igjen nar du vil.");
    };

    const handleFinalLineError = () => {
      if (finalPlaybackModeRef.current === "replay") {
        setDialoguePhase("completed");
        setActionMessage("Kunne ikke spille siste replikk pa nytt akkurat na.");
        return;
      }

      setDialoguePhase("awaitingAniReply");
      setActionMessage("Kunne ikke laste siste replikk. Sjekk nevron2.mp3.");
    };

    firstAudio.addEventListener("ended", handleFirstLineEnded);
    firstAudio.addEventListener("error", handleFirstLineError);
    finalAudio.addEventListener("ended", handleFinalLineEnded);
    finalAudio.addEventListener("error", handleFinalLineError);

    return () => {
      if (finalLineStartDelayRef.current !== null) {
        window.clearTimeout(finalLineStartDelayRef.current);
        finalLineStartDelayRef.current = null;
      }

      firstAudio.pause();
      firstAudio.removeEventListener("ended", handleFirstLineEnded);
      firstAudio.removeEventListener("error", handleFirstLineError);
      firstAudio.src = "";
      firstLineAudioRef.current = null;

      finalAudio.pause();
      finalAudio.removeEventListener("ended", handleFinalLineEnded);
      finalAudio.removeEventListener("error", handleFinalLineError);
      finalAudio.src = "";
      finalLineAudioRef.current = null;
    };
  }, []);

  return (
    <main className="vault-mission-page">
      <section className="vault-mission-shell">
        <p className="vault-mission__eyebrow">Vault Brief // Badunkadunk</p>
        <div className="vault-mission__music-row">
          <button type="button" className="vault-mission__music-button" onClick={handleMusicToggle}>
            {isMusicPlaying ? "Pause music" : "Play music"}
          </button>
          {musicNotice && <p className="vault-mission__music-status">{musicNotice}</p>}
        </div>
        <h1>Badunkadunk Vault er aktivt</h1>
        <p>
          {recipientName}, neste spor sier at Nevron patruljerer hvelvet og skjuler Chrono Stone.

        </p>
        <div className="vault-mission__statusbar">
          <span className={`vault-chip ${isTalking ? "is-active" : ""}`}>
            {isTalking ? "Nevron snakker..." : "Nevron venter"}
          </span>
          <span className="vault-chip">Samtaler: {talkCount}</span>
          <span className="vault-chip">Replay siste replikk: {finalReplayCount}</span>
        </div>
        {actionMessage && <p className="vault-mission__feedback">{actionMessage}</p>}

        {canReplyAsAni && (
          <div className="vault-mission__reply-box">
            <p>Ani sin tur:</p>
            <button type="button" onClick={handleAniReply}>
              Ani: "Jeg er her. Fortsett."
            </button>
          </div>
        )}

        {canReplayFinalLine && (
          <div className="vault-mission__replay-box">
            <button type="button" onClick={() => startFinalLine("replay")}>
              Spill siste replikk igjen
            </button>
          </div>
        )}

        <figure className="vault-mission-figure">
          {imageSource ? (
            <img
              src={imageSource}
              alt="Nevron i Badunkadunk Vault"
              loading="eager"
              onError={handleImageError}
              onClick={handleImageClick}
            />
          ) : (
            <div className="vault-mission-figure__missing">
              <p>Fant ikke Nevron-bildet.</p>
              <p>Legg filen i `public/images/worlds/adi-expedition/`.</p>
            </div>
          )}
        </figure>

        <button type="button" className="vault-mission__back" onClick={onBackToPortal}>
          Tilbake til portal-kartet
        </button>

        {showChoicePopup && (
          <div className="vault-choice-backdrop">
            <section className="vault-choice-popup" role="dialog" aria-modal="true" aria-label="Nevron-valg">
              <p className="vault-choice-popup__eyebrow">Nevron Interaksjon</p>
              <h2>Hva vil du gjore?</h2>
              <div className="vault-choice-popup__actions">
                <button type="button" onClick={handleTalkChoice}>
                  Snakke med Nevron
                </button>
                <button type="button" className="is-danger" onClick={handleKillChoice}>
                  Drepe Nevron
                </button>
              </div>
              <button
                type="button"
                className="vault-choice-popup__cancel"
                onClick={() => setShowChoicePopup(false)}
              >
                Avbryt
              </button>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
