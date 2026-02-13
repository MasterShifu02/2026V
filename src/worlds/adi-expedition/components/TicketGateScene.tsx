import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { StarfieldCanvas } from "../../../flows/intro";
import type { TimedMessage } from "../../../flows/intro";
import { ticketGateAudioConfig } from "../content/ticketGateAudio";
import { UniversalAccessTicket } from "./UniversalAccessTicket";

type TicketGateSceneProps = {
  recipientName: string;
  worldName: string;
  onUseTicket: () => void;
};

const EMPTY_MESSAGES: TimedMessage[] = [];

export function TicketGateScene({
  recipientName,
  worldName,
  onUseTicket
}: TicketGateSceneProps): JSX.Element {
  const [isGateDiscovered, setIsGateDiscovered] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isTicketLaidDown, setIsTicketLaidDown] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const sceneRef = useRef<HTMLElement | null>(null);
  const musicAudioRef = useRef<HTMLAudioElement | null>(null);
  const parallaxFrameRef = useRef<number | null>(null);
  const parallaxCurrentRef = useRef({ x: 0, y: 0 });
  const parallaxTargetRef = useRef({ x: 0, y: 0 });

  const handlePlanetClick = () => {
    setIsGateDiscovered(true);
  };

  const handleUnlockWithTicket = () => {
    if (isUnlocking) {
      return;
    }

    setIsUnlocking(true);
    window.setTimeout(() => {
      onUseTicket();
    }, 900);
  };

  const handleMusicToggle = () => {
    if (!musicAudioRef.current) {
      return;
    }

    if (isMusicPlaying) {
      musicAudioRef.current.pause();
      setIsMusicPlaying(false);
      return;
    }

    const playPromise = musicAudioRef.current.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true);
        })
        .catch(() => {
          setIsMusicPlaying(false);
        });
    }
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const scene = sceneRef.current;
    if (!scene) {
      return;
    }

    const rect = scene.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) {
      return;
    }

    const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
    const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
    parallaxTargetRef.current = {
      x: offsetX * 20,
      y: offsetY * 14
    };
  };

  const handlePointerLeave = () => {
    parallaxTargetRef.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    const audio = new Audio(ticketGateAudioConfig.themePath);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = ticketGateAudioConfig.volume;
    musicAudioRef.current = audio;

    const handleCanPlay = () => {
      const autoplayPromise = audio.play();
      if (autoplayPromise) {
        autoplayPromise
          .then(() => {
            setIsMusicPlaying(true);
          })
          .catch(() => {
            setIsMusicPlaying(false);
          });
      }
    };

    const handleError = () => {
      setIsMusicPlaying(false);
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

  useEffect(() => {
    const tick = () => {
      const scene = sceneRef.current;
      const current = parallaxCurrentRef.current;
      const target = parallaxTargetRef.current;

      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      if (scene) {
        scene.style.setProperty("--tg-title-x", `${(current.x * 0.28).toFixed(2)}px`);
        scene.style.setProperty("--tg-title-y", `${(current.y * 0.2).toFixed(2)}px`);
        scene.style.setProperty("--tg-music-x", `${(current.x * -0.14).toFixed(2)}px`);
        scene.style.setProperty("--tg-music-y", `${(current.y * -0.14).toFixed(2)}px`);
        scene.style.setProperty("--tg-planet-x", `${(current.x * 0.9).toFixed(2)}px`);
        scene.style.setProperty("--tg-planet-y", `${(current.y * 0.72).toFixed(2)}px`);
        scene.style.setProperty("--tg-console-x", `${(current.x * 0.42).toFixed(2)}px`);
        scene.style.setProperty("--tg-console-y", `${(current.y * 0.36).toFixed(2)}px`);
      }

      parallaxFrameRef.current = window.requestAnimationFrame(tick);
    };

    parallaxFrameRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (parallaxFrameRef.current !== null) {
        window.cancelAnimationFrame(parallaxFrameRef.current);
        parallaxFrameRef.current = null;
      }
    };
  }, []);

  return (
    <main
      className="ticket-gate-page"
      ref={sceneRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
    >
      <StarfieldCanvas messages={EMPTY_MESSAGES} />
      <h1 className="ticket-gate-title">The Univers</h1>
      <button type="button" className="ticket-gate-music-control" onClick={handleMusicToggle}>
        {isMusicPlaying ? "Pause music" : "Play music"}
      </button>

      <div className="ticket-planet-layer">
        <button
          type="button"
          className={`ticket-planet ${isGateDiscovered ? "is-discovered" : ""}`}
          onClick={handlePlanetClick}
          aria-label={`Aktiver inngangen til ${worldName}`}
        >
          <span className="ticket-planet__ring" />
          <span className="ticket-planet__surface">
            <span className="ticket-planet__lights" />
            <span className="ticket-planet__park-sign">E33</span>
            <span className="ticket-planet__orbit ticket-planet__orbit--one" />
            <span className="ticket-planet__orbit ticket-planet__orbit--two" />
          </span>
        </button>
      </div>

      <section className={`ticket-gate-console ${isGateDiscovered ? "is-visible" : ""}`}>
        <p className="ticket-gate-console__eyebrow">Port Detektert</p>
        <h2>Planet {worldName}</h2>
        <p>Bruk billetten din for a låse opp porten.</p>
        <button
          type="button"
          className="ticket-gate-console__ticket-toggle"
          onClick={() => setIsTicketLaidDown((previous) => !previous)}
        >
          {isTicketLaidDown ? "Vis billett" : "Legg ned billett"}
        </button>
        <div className={`ticket-gate-console__ticket-wrap ${isTicketLaidDown ? "is-collapsed" : ""}`}>
          <UniversalAccessTicket
            className="ticket-gate-console__ticket"
            destination={worldName}
            holderName={recipientName}
          />
        </div>
        <button
          type="button"
          className="ticket-gate-console__unlock"
          onClick={handleUnlockWithTicket}
          disabled={isUnlocking}
        >
          {isUnlocking ? "Laser opp..." : "Las opp med billett"}
        </button>
      </section>
    </main>
  );
}
