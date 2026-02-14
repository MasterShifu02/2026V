import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { openingAudioConfig } from "./content/openingAudio";
import { siteConfig } from "./content/siteConfig";
import { BlackHoleEscapeRoom } from "./flows/escape-room";
import { StarfieldCanvas, createMessages } from "./flows/intro";
import { ValentinePromptScene } from "./flows/prelude";
import {
  BadunkadunkVaultMission,
  CampMission,
  FrancoisFinalMission,
  GestralBriefingScene,
  MainHub,
  TicketGateScene,
  ValentineCongratsScene
} from "./worlds/adi-expedition";

function hasEscapeCompleted(): boolean {
  return window.sessionStorage.getItem(siteConfig.escapeCompletedStorageKey) === "completed";
}

function markEscapeCompleted(): void {
  window.sessionStorage.setItem(siteConfig.escapeCompletedStorageKey, "completed");
}

function hasEscapeTicket(): boolean {
  return window.sessionStorage.getItem(siteConfig.accessTicketStorageKey) === "granted";
}

function grantEscapeTicket(): void {
  window.sessionStorage.setItem(siteConfig.accessTicketStorageKey, "granted");
}

function hasCampMissionCompleted(): boolean {
  return window.sessionStorage.getItem(siteConfig.campMissionCompletedStorageKey) === "completed";
}

function markCampMissionCompleted(): void {
  window.sessionStorage.setItem(siteConfig.campMissionCompletedStorageKey, "completed");
}

function hasGestralStoneGranted(): boolean {
  return window.sessionStorage.getItem(siteConfig.gestralStoneGrantedStorageKey) === "granted";
}

function grantGestralStone(): void {
  window.sessionStorage.setItem(siteConfig.gestralStoneGrantedStorageKey, "granted");
}

function hasVaultMissionCompleted(): boolean {
  return window.sessionStorage.getItem(siteConfig.vaultMissionCompletedStorageKey) === "completed";
}

function markVaultMissionCompleted(): void {
  window.sessionStorage.setItem(siteConfig.vaultMissionCompletedStorageKey, "completed");
}

function hasFinalMissionCompleted(): boolean {
  return window.sessionStorage.getItem(siteConfig.finalMissionCompletedStorageKey) === "completed";
}

function markFinalMissionCompleted(): void {
  window.sessionStorage.setItem(siteConfig.finalMissionCompletedStorageKey, "completed");
}

function hasPreludeCompleted(): boolean {
  return window.sessionStorage.getItem(siteConfig.preludeCompletedStorageKey) === "completed";
}

function markPreludeCompleted(): void {
  window.sessionStorage.setItem(siteConfig.preludeCompletedStorageKey, "completed");
}

export default function App(): JSX.Element {
  const messages = useMemo(() => createMessages(siteConfig.recipientName), []);
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isWarpingToEscape, setIsWarpingToEscape] = useState(false);
  const [isIntroMusicPlaying, setIsIntroMusicPlaying] = useState(false);
  const [introMusicNotice, setIntroMusicNotice] = useState<string | null>(null);
  const [isEscapeDone, setIsEscapeDone] = useState<boolean>(() => hasEscapeCompleted());
  const [canAccessMainPage, setCanAccessMainPage] = useState<boolean>(() => hasEscapeTicket());
  const [hasGestralStone, setHasGestralStone] = useState<boolean>(() => hasGestralStoneGranted());
  const [isCampDone, setIsCampDone] = useState<boolean>(() => hasCampMissionCompleted());
  const [isVaultDone, setIsVaultDone] = useState<boolean>(() => hasVaultMissionCompleted());
  const [isFinalDone, setIsFinalDone] = useState<boolean>(() => hasFinalMissionCompleted());
  const [isPreludeDone, setIsPreludeDone] = useState<boolean>(() => hasPreludeCompleted());
  const introMusicAudioRef = useRef<HTMLAudioElement | null>(null);
  const introMusicFadeFrameRef = useRef<number | null>(null);
  const warpWhooshAudioRef = useRef<HTMLAudioElement | null>(null);
  const hasAllThreeStones = hasGestralStone && isCampDone && isVaultDone;

  const isMainPage = pathname === siteConfig.mainPagePath;
  const isCampMissionPage = pathname === siteConfig.campMissionPath;
  const isBadunkadunkVaultPage = pathname === siteConfig.badunkadunkVaultPath;
  const isFinalMissionPage = pathname === siteConfig.finalMissionPath;
  const isValentineCongratsPage = pathname === siteConfig.valentineCongratsPath;
  const isEscapePage = pathname === siteConfig.escapeRoomPath;
  const isTicketGatePage = pathname === siteConfig.ticketGatePath;
  const isIntroPage =
    !isMainPage &&
    !isCampMissionPage &&
    !isBadunkadunkVaultPage &&
    !isFinalMissionPage &&
    !isValentineCongratsPage &&
    !isEscapePage &&
    !isTicketGatePage;
  const isPreludePage = isIntroPage && !isPreludeDone;
  const isActualIntroPage = isIntroPage && isPreludeDone;

  const navigateTo = useCallback((path: string) => {
    if (window.location.pathname === path) {
      return;
    }

    window.history.pushState({}, "", path);
    setPathname(window.location.pathname);
  }, []);

  const fadeOutIntroMusic = useCallback((durationMs: number) => {
    const audio = introMusicAudioRef.current;
    if (!audio) {
      return;
    }

    if (introMusicFadeFrameRef.current !== null) {
      window.cancelAnimationFrame(introMusicFadeFrameRef.current);
      introMusicFadeFrameRef.current = null;
    }

    const startVolume = audio.volume;
    if (startVolume <= 0 || audio.paused) {
      audio.pause();
      audio.currentTime = 0;
      audio.volume = openingAudioConfig.volume;
      setIsIntroMusicPlaying(false);
      return;
    }

    const fadeDuration = Math.max(120, durationMs);
    const startTime = window.performance.now();

    const runFade = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / fadeDuration, 1);
      audio.volume = Math.max(startVolume * (1 - progress), 0);

      if (progress < 1) {
        introMusicFadeFrameRef.current = window.requestAnimationFrame(runFade);
        return;
      }

      audio.pause();
      audio.currentTime = 0;
      audio.volume = openingAudioConfig.volume;
      setIsIntroMusicPlaying(false);
      introMusicFadeFrameRef.current = null;
    };

    introMusicFadeFrameRef.current = window.requestAnimationFrame(runFade);
  }, []);

  const handleSequenceComplete = useCallback(() => {
    setShowContinueButton(true);
  }, []);

  const playWarpWhoosh = useCallback(() => {
    if (warpWhooshAudioRef.current) {
      warpWhooshAudioRef.current.pause();
      warpWhooshAudioRef.current.src = "";
      warpWhooshAudioRef.current = null;
    }

    const audio = new Audio(openingAudioConfig.warpWhooshPath);
    audio.preload = "auto";
    audio.volume = openingAudioConfig.warpWhooshVolume;
    warpWhooshAudioRef.current = audio;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch(() => {
        // Ignore blocked/missing SFX to avoid breaking intro flow.
      });
    }
  }, []);

  const handleStartEscape = useCallback(() => {
    if (isWarpingToEscape) {
      return;
    }

    setIsWarpingToEscape(true);
    playWarpWhoosh();
    fadeOutIntroMusic(Math.min(Math.max(siteConfig.introWarpDurationMs - 220, 450), 950));
    window.setTimeout(() => {
      navigateTo(siteConfig.escapeRoomPath);
    }, siteConfig.introWarpDurationMs);
  }, [fadeOutIntroMusic, isWarpingToEscape, navigateTo, playWarpWhoosh]);

  const handleIntroMusicToggle = useCallback(() => {
    if (!introMusicAudioRef.current) {
      setIntroMusicNotice("Fant ikke startsangen. Legg inn StartTheme.mp3.");
      return;
    }

    if (isIntroMusicPlaying) {
      introMusicAudioRef.current.pause();
      setIsIntroMusicPlaying(false);
      setIntroMusicNotice("Musikk pauset.");
      return;
    }

    const playPromise = introMusicAudioRef.current.play();
    if (playPromise) {
      playPromise
        .then(() => {
          setIsIntroMusicPlaying(true);
          setIntroMusicNotice("Musikk spiller.");
        })
        .catch(() => {
          setIsIntroMusicPlaying(false);
          setIntroMusicNotice("Trykk igjen for a starte musikken.");
        });
    }
  }, [isIntroMusicPlaying]);

  const handleEscapeCompleted = useCallback(() => {
    markEscapeCompleted();
    setIsEscapeDone(true);
    navigateTo(siteConfig.ticketGatePath);
  }, [navigateTo]);

  const handleUseTicketAtPlanet = useCallback(() => {
    grantEscapeTicket();
    setCanAccessMainPage(true);
    navigateTo(siteConfig.mainPagePath);
  }, [navigateTo]);

  const handleStartMainMission = useCallback((missionId: "games" | "quiz" | "surprises") => {
    if (missionId === "games") {
      navigateTo(siteConfig.campMissionPath);
      return;
    }

    if (missionId === "quiz") {
      navigateTo(siteConfig.badunkadunkVaultPath);
      return;
    }

    if (missionId === "surprises" && hasAllThreeStones) {
      navigateTo(siteConfig.finalMissionPath);
    }
  }, [hasAllThreeStones, navigateTo]);

  const handleBackToPortal = useCallback(() => {
    navigateTo(siteConfig.mainPagePath);
  }, [navigateTo]);

  const handleBackToPortalFromVault = useCallback(() => {
    markVaultMissionCompleted();
    setIsVaultDone(true);
    navigateTo(siteConfig.mainPagePath);
  }, [navigateTo]);

  const handleCampMissionCompleted = useCallback(() => {
    markCampMissionCompleted();
    setIsCampDone(true);
  }, []);

  const handleAcceptFirstStone = useCallback(() => {
    grantGestralStone();
    setHasGestralStone(true);
  }, []);

  const handleFinalMissionCompleted = useCallback(() => {
    markFinalMissionCompleted();
    setIsFinalDone(true);
    navigateTo(siteConfig.valentineCongratsPath);
  }, [navigateTo]);

  const handleStartRealExperience = useCallback(() => {
    markPreludeCompleted();
    setIsPreludeDone(true);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    if (!isActualIntroPage) {
      return;
    }

    const audio = new Audio(openingAudioConfig.sharedPath);
    audio.preload = "auto";
    audio.loop = true;
    audio.volume = openingAudioConfig.volume;
    introMusicAudioRef.current = audio;

    const handleCanPlay = () => {
      const autoplayPromise = audio.play();
      if (autoplayPromise) {
        autoplayPromise
          .then(() => {
            setIsIntroMusicPlaying(true);
            setIntroMusicNotice("Musikk spiller.");
          })
          .catch(() => {
            setIsIntroMusicPlaying(false);
            setIntroMusicNotice("Trykk pa musikk-knappen for a starte.");
          });
      }
    };

    const handleError = () => {
      setIsIntroMusicPlaying(false);
      setIntroMusicNotice("Fant ikke startsangen. Legg inn StartTheme.mp3.");
    };

    audio.addEventListener("canplay", handleCanPlay, { once: true });
    audio.addEventListener("error", handleError);

    return () => {
      if (introMusicFadeFrameRef.current !== null) {
        window.cancelAnimationFrame(introMusicFadeFrameRef.current);
        introMusicFadeFrameRef.current = null;
      }
      if (warpWhooshAudioRef.current) {
        warpWhooshAudioRef.current.pause();
        warpWhooshAudioRef.current.src = "";
        warpWhooshAudioRef.current = null;
      }
      audio.pause();
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("error", handleError);
      audio.src = "";
      introMusicAudioRef.current = null;
    };
  }, [isActualIntroPage]);

  useEffect(() => {
    if (isPreludePage) {
      document.title = siteConfig.preludePageTitle;
      return;
    }

    if (isMainPage && canAccessMainPage && !hasGestralStone) {
      document.title = siteConfig.gestralBriefingPageTitle;
      return;
    }

    if (isMainPage) {
      document.title = siteConfig.mainPageTitle;
      return;
    }

    if (isCampMissionPage) {
      document.title = siteConfig.campMissionPageTitle;
      return;
    }

    if (isBadunkadunkVaultPage) {
      document.title = siteConfig.badunkadunkVaultPageTitle;
      return;
    }

    if (isFinalMissionPage) {
      document.title = siteConfig.finalMissionPageTitle;
      return;
    }

    if (isValentineCongratsPage) {
      document.title = siteConfig.valentineCongratsPageTitle;
      return;
    }

    if (isTicketGatePage) {
      document.title = siteConfig.ticketGatePageTitle;
      return;
    }

    if (isEscapePage) {
      document.title = siteConfig.escapePageTitle;
      return;
    }

    document.title = siteConfig.pageTitle;
  }, [
    canAccessMainPage,
    hasGestralStone,
    isBadunkadunkVaultPage,
    isCampMissionPage,
    isEscapePage,
    isFinalMissionPage,
    isPreludePage,
    isMainPage,
    isValentineCongratsPage,
    isTicketGatePage
  ]);

  if (isPreludePage) {
    return (
      <ValentinePromptScene
        recipientName={siteConfig.recipientName}
        onStartRealExperience={handleStartRealExperience}
      />
    );
  }

  if (isValentineCongratsPage) {
    if (!canAccessMainPage) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Inngang Låst</p>
            <h1>Du ma bruke billetten forst</h1>
            <p className="locked-page__story">
              Fullfor escape room og bruk billetten for a ga videre i historien.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.mainPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.mainPagePath);
              }}
            >
              Til portalen
            </a>
          </section>
        </main>
      );
    }

    if (!isFinalDone) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Sekvens Låst</p>
            <h1>Fullfor finale-oppdraget forst</h1>
            <p className="locked-page__story">
              Overlever de tre steinene til Francois for a lase opp denne siden.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.finalMissionPath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.finalMissionPath);
              }}
            >
              Til Francois Throne
            </a>
          </section>
        </main>
      );
    }

    return (
      <ValentineCongratsScene
        recipientName={siteConfig.recipientName}
        onBackToPortal={handleBackToPortal}
      />
    );
  }

  if (isFinalMissionPage) {
    if (!canAccessMainPage) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Inngang Låst</p>
            <h1>Du ma bruke billetten forst</h1>
            <p className="locked-page__story">
              Fullfor escape room og bruk billetten i {siteConfig.mainWorldName} for a starte finalen.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.mainPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.mainPagePath);
              }}
            >
              Til portalen
            </a>
          </section>
        </main>
      );
    }

    if (!hasAllThreeStones) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Finale Låst</p>
            <h1>Tre steiner kreves</h1>
            <p className="locked-page__story">
              Skaff Gestral Stone, Aether Stone og Chrono Stone for a ga inn i Francois Throne.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.mainPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.mainPagePath);
              }}
            >
              Til portal-kartet
            </a>
          </section>
        </main>
      );
    }

    return (
      <FrancoisFinalMission
        recipientName={siteConfig.recipientName}
        onMissionCompleted={handleFinalMissionCompleted}
      />
    );
  }

  if (isBadunkadunkVaultPage) {
    if (!canAccessMainPage) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Inngang Låst</p>
            <h1>Du ma bruke billetten forst</h1>
            <p className="locked-page__story">
              Fullfor escape room og bruk billetten i {siteConfig.mainWorldName} for a starte hvelvet.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.mainPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.mainPagePath);
              }}
            >
              Til portalen
            </a>
          </section>
        </main>
      );
    }

    return (
      <BadunkadunkVaultMission
        recipientName={siteConfig.recipientName}
        onBackToPortal={handleBackToPortalFromVault}
      />
    );
  }

  if (isCampMissionPage) {
    if (!canAccessMainPage) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Inngang Låst</p>
            <h1>Du ma bruke billetten forst</h1>
            <p className="locked-page__story">
              Fullfor escape room og bruk billetten i {siteConfig.mainWorldName} for a starte Camp.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.mainPagePath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.mainPagePath);
              }}
            >
              Til portalen
            </a>
          </section>
        </main>
      );
    }

    return (
      <CampMission
        recipientName={siteConfig.recipientName}
        onBackToPortal={handleBackToPortal}
        onMissionCompleted={handleCampMissionCompleted}
      />
    );
  }

  if (isMainPage) {
    if (!canAccessMainPage) {
      if (isEscapeDone) {
        return (
          <TicketGateScene
            recipientName={siteConfig.recipientName}
            worldName={siteConfig.mainWorldName}
            onUseTicket={handleUseTicketAtPlanet}
          />
        );
      }

      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Tomt Univers</p>
            <h1>Du ma fullfore escape room forst</h1>
            <p className="locked-page__story">
              Porten til {siteConfig.mainWorldName} reagerer bare pa billetten fra black hole.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.escapeRoomPath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.escapeRoomPath);
              }}
            >
              Gaa til black hole
            </a>
          </section>
        </main>
      );
    }

    if (!hasGestralStone) {
      return (
        <GestralBriefingScene
          recipientName={siteConfig.recipientName}
          worldName={siteConfig.mainWorldName}
          onAcceptFirstStone={handleAcceptFirstStone}
        />
      );
    }

    return (
      <MainHub
        recipientName={siteConfig.recipientName}
        worldName={siteConfig.mainWorldName}
        hasGestralStone={hasGestralStone}
        campMissionCompleted={isCampDone}
        vaultMissionCompleted={isVaultDone}
        finalMissionCompleted={isFinalDone}
        onStartMission={handleStartMainMission}
      />
    );
  }

  if (isEscapePage) {
    return (
      <BlackHoleEscapeRoom
        recipientName={siteConfig.recipientName}
        worldName={siteConfig.mainWorldName}
        showDevSkip={siteConfig.enableDevEscapeSkip}
        onEscapeCompleted={handleEscapeCompleted}
      />
    );
  }

  if (isTicketGatePage) {
    if (!isEscapeDone) {
      return (
        <main className="locked-page">
          <section className="locked-page__card">
            <p className="locked-page__eyebrow">Ingen Billett Enda</p>
            <h1>Du er ikke ute av black hole ennå</h1>
            <p className="locked-page__story">
              Fullfor escape room for a finne billetten til {siteConfig.mainWorldName}.
            </p>
            <a
              className="locked-page__action"
              href={siteConfig.escapeRoomPath}
              onClick={(event) => {
                event.preventDefault();
                navigateTo(siteConfig.escapeRoomPath);
              }}
            >
              Start escape room
            </a>
          </section>
        </main>
      );
    }

    return (
      <TicketGateScene
        recipientName={siteConfig.recipientName}
        worldName={siteConfig.mainWorldName}
        onUseTicket={handleUseTicketAtPlanet}
      />
    );
  }

  return (
    <>
      <StarfieldCanvas messages={messages} onSequenceComplete={handleSequenceComplete} />
      <button type="button" className="intro-music-control" onClick={handleIntroMusicToggle}>
        {isIntroMusicPlaying ? "Pause music" : "Play music"}
      </button>
      {introMusicNotice && <p className="intro-music-status">{introMusicNotice}</p>}
      <button
        className={`continue-button ${showContinueButton ? "is-visible" : ""}`}
        type="button"
        onClick={handleStartEscape}
        disabled={isWarpingToEscape}
      >
        {siteConfig.continueButtonLabel}
      </button>
      <p className={`intro-story ${showContinueButton ? "is-visible" : ""}`}>
        I det du trykker, revner universet og drar deg inn i et black hole. Los gaetene,
        finn billetten, og apne veien til {siteConfig.mainWorldName}.
      </p>
      <div className={`warp-transition ${isWarpingToEscape ? "is-active" : ""}`} aria-hidden>
        <div className="warp-transition__hole" />
      </div>
    </>
  );
}
