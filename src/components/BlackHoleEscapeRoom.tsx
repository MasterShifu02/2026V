import { FormEvent, useEffect, useMemo, useState } from "react";
import { escapeReward, escapeRiddles } from "../content/escapeRoom";

type BlackHoleEscapeRoomProps = {
  recipientName: string;
  worldName: string;
  showDevSkip?: boolean;
  onEscapeCompleted: () => void;
};

type StatusMessage = {
  tone: "success" | "error";
  text: string;
};

type ConfettiPiece = {
  id: number;
  left: number;
  delay: number;
  duration: number;
  rotation: number;
  color: string;
};

function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function createConfettiPieces(count: number): ConfettiPiece[] {
  const colors = ["#79a6ff", "#2d2dff", "#8cffc8", "#ffe27a", "#ffffff"];

  return Array.from({ length: count }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 0.8,
    duration: 2.4 + Math.random() * 1.8,
    rotation: Math.random() * 360,
    color: colors[index % colors.length]
  }));
}

export function BlackHoleEscapeRoom({
  recipientName,
  worldName,
  showDevSkip = false,
  onEscapeCompleted
}: BlackHoleEscapeRoomProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answerInput, setAnswerInput] = useState("");
  const [status, setStatus] = useState<StatusMessage | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isWarpingOut, setIsWarpingOut] = useState(false);

  const confettiPieces = useMemo(() => createConfettiPieces(54), []);
  const totalRiddles = escapeRiddles.length;
  const activeRiddle = escapeRiddles[currentIndex];
  const progressPercent = Math.round((currentIndex / totalRiddles) * 100);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!activeRiddle) {
      return;
    }

    const normalizedInput = normalizeAnswer(answerInput);
    if (normalizedInput.length === 0) {
      setStatus({ tone: "error", text: "Skriv et svar for a holde deg borte fra morket." });
      return;
    }

    const isMatch = activeRiddle.answers.some(
      (answer) => normalizeAnswer(answer) === normalizedInput
    );

    if (!isMatch) {
      setStatus({ tone: "error", text: "Feil svar. Gravitasjonen slipper deg ikke ennå." });
      return;
    }

    if (currentIndex === totalRiddles - 1) {
      setIsCompleted(true);
      setStatus(null);
      return;
    }

    setCurrentIndex((previous) => previous + 1);
    setAnswerInput("");
    setStatus({ tone: "success", text: "Riktig! Du har svekket black hole-kjernen." });
  };

  const handleLeaveBlackHole = () => {
    if (isWarpingOut) {
      return;
    }

    setIsWarpingOut(true);
  };

  useEffect(() => {
    if (!isWarpingOut) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      onEscapeCompleted();
    }, 1200);

    return () => window.clearTimeout(timeoutId);
  }, [isWarpingOut, onEscapeCompleted]);

  return (
    <main className="black-hole-page">
      <div className="black-hole-scene" aria-hidden>
        <div className="black-hole-vignette" />
        <div className="black-hole-noise" />
        <div className="black-hole-ring black-hole-ring--outer" />
        <div className="black-hole-ring black-hole-ring--inner" />
        <div className="black-hole-ring black-hole-ring--pulse" />
        <div className="black-hole-core" />
      </div>

      <section className="escape-card">
        {showDevSkip && (
          <button className="escape-skip" type="button" onClick={onEscapeCompleted}>
            Skip escape (dev)
          </button>
        )}

        {!isCompleted && activeRiddle && (
          <>
            <p className="escape-eyebrow">Black Hole Escape</p>
            <h1>Hold ut, {recipientName}</h1>
            <p className="escape-intro">
              Du ble sugd inn i et skummelt black hole. Los {totalRiddles} sma gater for a bryte
              gravitasjonen og finne veien hjem.
            </p>

            <div className="escape-progress" aria-label="Fremdrift">
              <span>
                Gate {currentIndex + 1} av {totalRiddles}
              </span>
              <span>{progressPercent}%</span>
            </div>
            <div className="escape-progressbar">
              <div style={{ width: `${progressPercent}%` }} />
            </div>

            <h2>{activeRiddle.question}</h2>
            <p className="escape-hint">{activeRiddle.hint}</p>

            <form className="escape-form" onSubmit={handleSubmit}>
              <input
                autoFocus
                type="text"
                value={answerInput}
                onChange={(event) => setAnswerInput(event.target.value)}
                placeholder="Skriv svaret her"
              />
              <button type="submit">Lås opp</button>
            </form>

            {status && (
              <p className={`escape-status ${status.tone === "error" ? "is-error" : "is-success"}`}>
                {status.text}
              </p>
            )}
          </>
        )}

        {isCompleted && (
          <>
            <div className="confetti-layer" aria-hidden>
              {confettiPieces.map((piece) => (
                <span
                  key={piece.id}
                  className="confetti-piece"
                  style={{
                    left: `${piece.left}%`,
                    animationDelay: `${piece.delay}s`,
                    animationDuration: `${piece.duration}s`,
                    transform: `rotate(${piece.rotation}deg)`,
                    backgroundColor: piece.color
                  }}
                />
              ))}
            </div>

            <p className="escape-eyebrow">Escape Complete</p>
            <h1>{escapeReward.heading}</h1>
            <p className="escape-finale">
              {escapeReward.message} Du svever na i et tomt univers med bare stjerner, og langt borte
              glitrer spilleparken {worldName}.
            </p>

            <div className="escape-coupon">
              <p>{escapeReward.ticketLabel}</p>
              <strong>{escapeReward.ticketValue}</strong>
            </div>

            <p className="escape-redirect">
              Ta med billetten videre. Den ma brukes ved planet-porten til {worldName}.
            </p>

            <button className="escape-complete-action" type="button" onClick={handleLeaveBlackHole}>
              {isWarpingOut ? "Forlater black hole..." : "Forlat black hole"}
            </button>
          </>
        )}
      </section>
    </main>
  );
}
