import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { mainHubAudioConfig } from "../content/mainHubAudio";
import { hubSections } from "../content/hubSections";

type MainHubProps = {
  recipientName: string;
  worldName: string;
  hasGestralStone: boolean;
  campMissionCompleted: boolean;
  vaultMissionCompleted: boolean;
  finalMissionCompleted: boolean;
  onStartMission: (missionId: (typeof hubSections)[number]["id"]) => void;
};

type PortalNode = {
  id: (typeof hubSections)[number]["id"];
  positionX: string;
  positionY: string;
  labelSide: "left" | "right";
};

const portalNodes: PortalNode[] = [
  {
    id: "games",
    positionX: "70%",
    positionY: "62%",
    labelSide: "right"
  },
  {
    id: "quiz",
    positionX: "47%",
    positionY: "38%",
    labelSide: "left"
  },
  {
    id: "surprises",
    positionX: "25%",
    positionY: "76%",
    labelSide: "right"
  }
];

export function MainHub({
  recipientName,
  worldName,
  hasGestralStone,
  campMissionCompleted,
  vaultMissionCompleted,
  finalMissionCompleted,
  onStartMission
}: MainHubProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<(typeof hubSections)[number]["id"]>("games");
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [musicNotice, setMusicNotice] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const hubMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackIndexRef = useRef(0);
  const selectedSection = useMemo(
    () => hubSections.find((section) => section.id === selectedId) ?? hubSections[0],
    [selectedId]
  );
  const hasAllThreeStones = hasGestralStone && campMissionCompleted && vaultMissionCompleted;
  const canStartSelectedMission = selectedSection.id !== "surprises" || hasAllThreeStones;
  const getSectionStatus = (id: (typeof hubSections)[number]["id"], fallbackStatus: string): string => {
    if (id === "games" && campMissionCompleted) {
      return "Fullfort";
    }

    if (id === "quiz" && vaultMissionCompleted) {
      return "Fullfort";
    }

    if (id === "surprises" && finalMissionCompleted) {
      return "Fullfort";
    }

    if (id === "surprises" && hasAllThreeStones) {
      return "Apen";
    }

    return fallbackStatus;
  };

  const playTrack = (trackIndex: number, reason: "auto" | "manual") => {
    if (!hubMusicAudioRef.current) {
      setMusicNotice("Fant ikke hovedside-musikken. Legg inn HovedTheme.mp3 og HovedTheme2.mp3.");
      return;
    }

    const track = mainHubAudioConfig.tracks[trackIndex];
    if (!track) {
      return;
    }

    currentTrackIndexRef.current = trackIndex;
    setCurrentTrackIndex(trackIndex);
    hubMusicAudioRef.current.src = track.path;
    hubMusicAudioRef.current.currentTime = 0;
    hubMusicAudioRef.current.load();

    const playPromise = hubMusicAudioRef.current.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true);
          setMusicNotice(
            reason === "auto" ? `Spiller: ${track.title}` : `Byttet til: ${track.title}`
          );
        })
        .catch(() => {
          setIsMusicPlaying(false);
          setMusicNotice("Trykk pa musikk-knappen for a starte hovedside-musikken.");
        });
    }
  };

  const handleMusicToggle = () => {
    if (!hubMusicAudioRef.current) {
      setMusicNotice("Fant ikke hovedside-musikken. Legg inn HovedTheme.mp3 og HovedTheme2.mp3.");
      return;
    }

    if (isMusicPlaying) {
      hubMusicAudioRef.current.pause();
      setIsMusicPlaying(false);
      setMusicNotice("Musikk pauset.");
      return;
    }

    if (!hubMusicAudioRef.current.src) {
      playTrack(currentTrackIndexRef.current, "manual");
      return;
    }

    const playPromise = hubMusicAudioRef.current.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsMusicPlaying(true);
          const track = mainHubAudioConfig.tracks[currentTrackIndexRef.current];
          setMusicNotice(track ? `Spiller: ${track.title}` : "Musikk spiller.");
        })
        .catch(() => {
          setIsMusicPlaying(false);
          setMusicNotice("Trykk igjen for a starte musikken.");
        });
    }
  };

  const handleNextTrack = () => {
    const nextTrackIndex = (currentTrackIndexRef.current + 1) % mainHubAudioConfig.tracks.length;
    playTrack(nextTrackIndex, "manual");
  };

  useEffect(() => {
    const audio = new Audio();
    audio.preload = "auto";
    audio.loop = false;
    audio.volume = mainHubAudioConfig.volume;
    hubMusicAudioRef.current = audio;

    const handleAudioError = () => {
      setIsMusicPlaying(false);
      setMusicNotice("Fant ikke hovedside-musikken. Legg inn HovedTheme.mp3 og HovedTheme2.mp3.");
    };

    const handleAudioEnded = () => {
      const nextTrackIndex = (currentTrackIndexRef.current + 1) % mainHubAudioConfig.tracks.length;
      playTrack(nextTrackIndex, "auto");
    };

    audio.addEventListener("error", handleAudioError);
    audio.addEventListener("ended", handleAudioEnded);

    playTrack(0, "auto");

    return () => {
      audio.pause();
      audio.removeEventListener("error", handleAudioError);
      audio.removeEventListener("ended", handleAudioEnded);
      audio.src = "";
      hubMusicAudioRef.current = null;
    };
  }, []);

  return (
    <main className="world-map-page">
      <section className="world-map-shell">
        <div className="world-map-audio">
          <button type="button" className="world-map-audio__button" onClick={handleMusicToggle}>
            {isMusicPlaying ? "Pause music" : "Play music"}
          </button>
          <button type="button" className="world-map-audio__button" onClick={handleNextTrack}>
            Neste sang
          </button>
          <span className="world-map-audio__track">
            Spor {currentTrackIndex + 1}/{mainHubAudioConfig.tracks.length}
          </span>
          {musicNotice && <p className="world-map-audio__status">{musicNotice}</p>}
        </div>
        <section className="world-map-stage">
          <section className="world-map-canvas" aria-label={`${worldName} kart`}>
            <article className={`world-map-alert ${isAlertOpen ? "is-open" : "is-closed"}`}>
              <div className="world-map-alert__top">
                <p className="world-map-alert__eyebrow">Nodsignal // Prioritet 33</p>
                <button
                  type="button"
                  className="world-map-alert__toggle"
                  onClick={() => setIsAlertOpen((previous) => !previous)}
                  aria-expanded={isAlertOpen}
                >
                  {isAlertOpen ? "Lukk" : "Apne"}
                </button>
              </div>
              {isAlertOpen && (
                <>
                  <h1>Francois har kidnappet Adi</h1>
                  <p>
                    Francuis truer alle i Lumiere og sier at han kun slipper Adi fri når han har fatt
                    tilbake sine 3 steiner.
                  </p>
                  <p>
                    {recipientName}, Gestral Stone er sikret 1/3. Hent de 2 neste steinene i Camp og
                    Badunkadunk Vault.
                  </p>
                </>
              )}
            </article>

            {portalNodes.map((node) => {
              const section = hubSections.find((item) => item.id === node.id);
              if (!section) {
                return null;
              }

              const style = {
                "--portal-x": node.positionX,
                "--portal-y": node.positionY
              } as CSSProperties;

              return (
                <button
                  key={node.id}
                  type="button"
                  style={style}
                  className={`world-map-node world-map-node--${node.id} world-map-node--label-${node.labelSide} ${selectedId === node.id ? "is-active" : ""}`}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span className="world-map-node__pin" />
                  <span className="world-map-node__label">
                    <span className="world-map-node__title">{section.title}</span>
                    <span className="world-map-node__zone">{section.zoneName}</span>
                    <span className="world-map-node__stone">{section.stoneName}</span>
                  </span>
                </button>
              );
            })}
          </section>

          <section className="world-map-panel">
            <p className="world-map-panel__eyebrow">Operasjon Frigjoring</p>
            <h2>Tre steiner ma hentes</h2>
            <p className="world-map-panel__story">
              Francois holder Adi fanget. Samle alle tre steiner for a aktivere porten og slippe Adi
              fri.
            </p>
            <ul className="world-map-stone-list">
              <li className={hasGestralStone ? "is-active" : ""}>
                <span className="world-map-stone-list__stone">Gestral Stone</span>
                <span className="world-map-stone-list__status">
                  {hasGestralStone ? "Mottatt" : "Mangler"}
                </span>
              </li>
              {hubSections.map((section) => (
                <li key={section.id} className={section.id === selectedSection.id ? "is-active" : ""}>
                  <span className="world-map-stone-list__stone">{section.stoneName}</span>
                  <span className="world-map-stone-list__status">
                    {getSectionStatus(section.id, section.status)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="world-map-panel__divider" />

            <p className="world-map-panel__eyebrow">Valgt Oppdrag</p>
            <h3 className="world-map-panel__title">{selectedSection.title}</h3>
            <p className="world-map-panel__location">{selectedSection.zoneName}</p>
            <button
              type="button"
              onClick={() => onStartMission(selectedSection.id)}
              disabled={!canStartSelectedMission}
            >
              {selectedSection.id === "games" && "Start Camp-oppdraget"}
              {selectedSection.id === "quiz" && "Start Badunkadunk Vault"}
              {selectedSection.id === "surprises" && !hasAllThreeStones && "Last til tre steiner"}
              {selectedSection.id === "surprises" && hasAllThreeStones && !finalMissionCompleted && "Mot Francois"}
              {selectedSection.id === "surprises" && finalMissionCompleted && "Se sluttoppropet igjen"}
            </button>
            {!canStartSelectedMission && (
              <p className="world-map-panel__hint">
                Denne sonen apnes nar du har Gestral Stone + steinene fra Camp og Badunkadunk Vault.
              </p>
            )}
          </section>
        </section>
      </section>
    </main>
  );
}
