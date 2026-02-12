import { useCallback, useEffect, useMemo, useState } from "react";
import { BlackHoleEscapeRoom } from "./components/BlackHoleEscapeRoom";
import { MainHub } from "./components/MainHub";
import { StarfieldCanvas } from "./components/StarfieldCanvas";
import { TicketGateScene } from "./components/TicketGateScene";
import { createMessages } from "./content/messages";
import { siteConfig } from "./content/siteConfig";

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

export default function App(): JSX.Element {
  const messages = useMemo(() => createMessages(siteConfig.recipientName), []);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [isWarpingToEscape, setIsWarpingToEscape] = useState(false);
  const [isEscapeDone, setIsEscapeDone] = useState<boolean>(() => hasEscapeCompleted());
  const [canAccessMainPage, setCanAccessMainPage] = useState<boolean>(() => hasEscapeTicket());
  const pathname = window.location.pathname;

  const isMainPage = pathname === siteConfig.mainPagePath;
  const isEscapePage = pathname === siteConfig.escapeRoomPath;
  const isTicketGatePage = pathname === siteConfig.ticketGatePath;

  const handleSequenceComplete = useCallback(() => {
    setShowContinueButton(true);
  }, []);

  const handleStartEscape = useCallback(() => {
    if (isWarpingToEscape) {
      return;
    }

    setIsWarpingToEscape(true);
    window.setTimeout(() => {
      window.location.assign(siteConfig.escapeRoomPath);
    }, siteConfig.introWarpDurationMs);
  }, [isWarpingToEscape]);

  const handleEscapeCompleted = useCallback(() => {
    markEscapeCompleted();
    setIsEscapeDone(true);
    window.location.assign(siteConfig.ticketGatePath);
  }, []);

  const handleUseTicketAtPlanet = useCallback(() => {
    grantEscapeTicket();
    setCanAccessMainPage(true);
    window.location.assign(siteConfig.mainPagePath);
  }, []);

  useEffect(() => {
    if (isMainPage) {
      document.title = siteConfig.mainPageTitle;
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
  }, [isEscapePage, isMainPage, isTicketGatePage]);

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
            <a className="locked-page__action" href={siteConfig.escapeRoomPath}>
              Gaa til black hole
            </a>
          </section>
        </main>
      );
    }

    return <MainHub recipientName={siteConfig.recipientName} worldName={siteConfig.mainWorldName} />;
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
            <a className="locked-page__action" href={siteConfig.escapeRoomPath}>
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
