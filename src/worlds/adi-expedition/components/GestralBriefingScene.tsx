import { useEffect, useRef, useState } from "react";
import { withBase } from "../../../content/basePath";
import { StarfieldCanvas } from "../../../flows/intro";
import type { TimedMessage } from "../../../flows/intro";
import { gestralDialogue } from "../content/gestralDialogue";

type GestralBriefingSceneProps = {
  recipientName: string;
  worldName: string;
  onAcceptFirstStone: () => void;
};

const EMPTY_MESSAGES: TimedMessage[] = [];
const GESTRAL_IMAGE_CANDIDATES = [withBase("/images/worlds/adi-expedition/Gestral.jpg")] as const;

export function GestralBriefingScene({
  recipientName,
  worldName,
  onAcceptFirstStone
}: GestralBriefingSceneProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [isAcceptingStone, setIsAcceptingStone] = useState(false);
  const acceptStoneTimeoutRef = useRef<number | null>(null);
  const imageSource = GESTRAL_IMAGE_CANDIDATES[imageIndex] ?? null;

  useEffect(() => {
    return () => {
      if (acceptStoneTimeoutRef.current !== null) {
        window.clearTimeout(acceptStoneTimeoutRef.current);
        acceptStoneTimeoutRef.current = null;
      }
    };
  }, []);

  const handleAcceptStone = () => {
    if (isAcceptingStone) {
      return;
    }

    setIsAcceptingStone(true);
    acceptStoneTimeoutRef.current = window.setTimeout(() => {
      onAcceptFirstStone();
      acceptStoneTimeoutRef.current = null;
    }, 1300);
  };

  const handleImageError = () => {
    setImageIndex((previous) => previous + 1);
  };

  return (
    <main className="gestral-briefing-page">
      <StarfieldCanvas messages={EMPTY_MESSAGES} />
      <section className="gestral-briefing-shell">
        <p className="gestral-briefing__eyebrow">Mote I Tomrommet</p>
        <h1>{gestralDialogue.title}</h1>
        <figure className="gestral-briefing-portrait">
          {imageSource ? (
            <img
              src={imageSource}
              alt="Gestral budbringer i tomrommet"
              loading="eager"
              onError={handleImageError}
            />
          ) : (
            <div className="gestral-briefing-portrait__missing">
              <p>Fant ikke Gestral-bildet.</p>
              <p>Legg filen i `public/images/worlds/adi-expedition/`.</p>
            </div>
          )}
        </figure>
        <section className="gestral-dialogue" aria-label="Gestral-dialog">
          {gestralDialogue.lines.map((line) => (
            <p key={line.text}>
              <strong>{line.speaker}:</strong> {line.text}
            </p>
          ))}
          <p className="gestral-dialogue__ani">
            <strong>{recipientName}:</strong> hmm... Adi trenger min hjelp i {worldName} planet.
          </p>
        </section>

        <div className="gestral-briefing__actions">
          <button type="button" onClick={handleAcceptStone} disabled={isAcceptingStone}>
            {isAcceptingStone ? "Stein synkroniseres..." : "Ta imot Gestral Stone"}
          </button>
        </div>
      </section>
      {isAcceptingStone && (
        <div className="gestral-return-sequence" aria-hidden>
          <div className="gestral-return-sequence__stone" />
          <p className="gestral-return-sequence__text">Gestral Stone synkroniseres med portalen...</p>
        </div>
      )}
    </main>
  );
}
