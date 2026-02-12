import { hubSections } from "../content/hubSections";

type MainHubProps = {
  recipientName: string;
  worldName: string;
};

export function MainHub({ recipientName, worldName }: MainHubProps): JSX.Element {
  return (
    <main className="home-page">
      <section className="home-page__content">
        <p className="home-page__eyebrow">Velkommen, {recipientName}</p>
        <h1>{worldName}</h1>
        <p className="home-page__intro">
          Med stjernebilletten i handa har du endelig kommet fram. Porten er apen, og eventyret kan
          begynne.
        </p>
        <div className="home-page__grid">
          {hubSections.map((section) => (
            <article className="hub-card" key={section.id}>
              <p className="hub-card__status">{section.status}</p>
              <h2>{section.title}</h2>
              <p>{section.subtitle}</p>
              <ul>
                {section.ideas.map((idea) => (
                  <li key={idea}>{idea}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
