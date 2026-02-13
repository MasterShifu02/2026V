import { useState } from "react";
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
const GESTRAL_IMAGE_CANDIDATES = [
  withBase("/images/worlds/adi-expedition/Gestral.jpg"),
  withBase("/images/worlds/adi-expedition/gestral.jpg"),
  withBase("/images/worlds/adi-expedition/Gestral.png"),
  withBase("/images/worlds/adi-expedition/gestral.png"),
  withBase("/images/worlds/adi-expedition/Gestral.webp"),
  withBase("/images/worlds/adi-expedition/gestral.webp")
] as const;

export function GestralBriefingScene({
  recipientName,
  worldName,
  onAcceptFirstStone
}: GestralBriefingSceneProps): JSX.Element {
  const [imageIndex, setImageIndex] = useState(0);
  const [isAcceptingStone, setIsAcceptingStone] = useState(false);
  const imageSource = GESTRAL_IMAGE_CANDIDATES[imageIndex] ?? null;

  const handleAcceptStone = () => {
    if (isAcceptingStone) {
      return;
    }

    setIsAcceptingStone(true);
    window.setTimeout(() => {
      onAcceptFirstStone();
    }, 1000);
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
            <strong>{recipientName}:</strong> Jeg skal finne alle steinene og hente Adi tilbake.
          </p>
          <p className="gestral-dialogue__next">
            Neste steg: Camp og Badunkadunk Vault, deretter finalen i {worldName}.
          </p>
        </section>

        <div className="gestral-briefing__actions">
          <button type="button" onClick={handleAcceptStone} disabled={isAcceptingStone}>
            {isAcceptingStone ? "Stein synkroniseres..." : "Ta imot Gestral Stone"}
          </button>
        </div>
      </section>
    </main>
  );
}
