type UniversalAccessTicketProps = {
  destination: string;
  holderName: string;
  issuer?: string;
  ticketCode?: string;
  className?: string;
};

function buildTicketCode(destination: string, holderName: string): string {
  const destinationTag = destination.replace(/[^a-zA-Z0-9]/g, "").slice(0, 4).toUpperCase() || "NODE";
  const holderTag = holderName.replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "USR";
  return `${destinationTag}-${holderTag}-33`;
}

export function UniversalAccessTicket({
  destination,
  holderName,
  issuer = "Guardians of the galaxy",
  ticketCode,
  className
}: UniversalAccessTicketProps): JSX.Element {
  const resolvedCode = ticketCode ?? buildTicketCode(destination, holderName);

  return (
    <article className={`universal-ticket ${className ?? ""}`.trim()} aria-label="Universal access ticket">
      <span className="universal-ticket__shine" aria-hidden />
      <p className="universal-ticket__eyebrow">Universal Access Ticket</p>
      <p className="universal-ticket__destination">{destination}</p>
      <div className="universal-ticket__meta">
        <span>
          <strong>Holder</strong>
          <em>{holderName}</em>
        </span>
        <span>
          <strong>Issued by</strong>
          <em>{issuer}</em>
        </span>
      </div>
      <div className="universal-ticket__footer">
        <span className="universal-ticket__code">{resolvedCode}</span>
        <span className="universal-ticket__barcode" aria-hidden />
      </div>
    </article>
  );
}
