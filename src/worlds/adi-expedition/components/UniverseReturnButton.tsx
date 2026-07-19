type UniverseReturnButtonProps = {
  onReturn: () => void;
};

export function UniverseReturnButton({ onReturn }: UniverseReturnButtonProps): JSX.Element {
  return (
    <button
      type="button"
      className="universe-return-button"
      onClick={onReturn}
      aria-label="Tilbake til universet"
    >
      <span aria-hidden>←</span> Universet
    </button>
  );
}
