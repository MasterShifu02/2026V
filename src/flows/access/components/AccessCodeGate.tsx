import { FormEvent, useState } from "react";
import { StarfieldCanvas } from "../../intro";
import type { TimedMessage } from "../../intro";

type AccessCodeGateProps = {
  onUnlock: () => void;
};

const EMPTY_MESSAGES: TimedMessage[] = [];
const ACCESS_CODE = "Kjære";

function normalizeCode(value: string): string {
  return value.trim().normalize("NFC").toLocaleLowerCase("nb-NO");
}

export function AccessCodeGate({ onUnlock }: AccessCodeGateProps): JSX.Element {
  const [code, setCode] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (normalizeCode(code) !== normalizeCode(ACCESS_CODE)) {
      setErrorMessage("Det var ikke den riktige koden. Prøv igjen.");
      return;
    }

    setErrorMessage(null);
    onUnlock();
  };

  return (
    <main className="access-code-page">
      <StarfieldCanvas messages={EMPTY_MESSAGES} />
      <div className="access-code-glow" aria-hidden />
      <section className="access-code-card" aria-labelledby="access-code-title">
        <p className="access-code-eyebrow">Privat univers</p>
        <h1 id="access-code-title">Bare for den som kjenner koden</h1>
        <p className="access-code-intro">Skriv inn kodeordet for å åpne Valentine-universet.</p>

        <form className="access-code-form" onSubmit={handleSubmit}>
          <label htmlFor="access-code-input">Kodeord</label>
          <input
            id="access-code-input"
            autoFocus
            autoComplete="off"
            type="password"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            aria-invalid={errorMessage ? "true" : "false"}
            aria-describedby={errorMessage ? "access-code-error" : undefined}
          />
          <button type="submit">Åpne universet</button>
        </form>

        {errorMessage && (
          <p id="access-code-error" className="access-code-error" role="alert">
            {errorMessage}
          </p>
        )}
      </section>
    </main>
  );
}
