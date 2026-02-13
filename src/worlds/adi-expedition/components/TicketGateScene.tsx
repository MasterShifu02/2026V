import { useState } from "react";
import { StarfieldCanvas } from "../../../flows/intro";
import type { TimedMessage } from "../../../flows/intro";

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

  return (
    <main className="ticket-gate-page">
      <StarfieldCanvas messages={EMPTY_MESSAGES} />

      <section className="ticket-gate-overlay">
        <p className="ticket-gate-eyebrow">Tomt Univers</p>
        <h1>Du er fri fra black hole, {recipientName}</h1>
        <p>
          Rundt deg er det bare stjerner. Langt borte pa siden ser du en liten planet som markerer
          inngangen til {worldName}.
        </p>
        <p>Klikk planeten for a aktivere inngangen. Deretter ma du bruke billetten for a komme inn.</p>
      </section>

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

      <section className={`ticket-gate-console ${isGateDiscovered ? "is-visible" : ""}`}>
        <p className="ticket-gate-console__eyebrow">Port Detektert</p>
        <h2>Inngang til {worldName}</h2>
        <p>Planet-signatur bekreftet. Bruk billetten din for a lase opp porten.</p>
        <button type="button" onClick={handleUnlockWithTicket} disabled={isUnlocking}>
          {isUnlocking ? "Laser opp..." : "Las opp med billett"}
        </button>
      </section>
    </main>
  );
}
