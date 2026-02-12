import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { hubSections } from "../content/hubSections";

type MainHubProps = {
  recipientName: string;
  worldName: string;
};

type PortalNode = {
  id: (typeof hubSections)[number]["id"];
  zoneName: string;
  positionX: string;
  positionY: string;
  labelSide: "left" | "right";
};

const portalNodes: PortalNode[] = [
  {
    id: "games",
    zoneName: "Camp 33 Arena",
    positionX: "70%",
    positionY: "62%",
    labelSide: "right"
  },
  {
    id: "quiz",
    zoneName: "Lumiere Arkiv",
    positionX: "47%",
    positionY: "38%",
    labelSide: "left"
  },
  {
    id: "surprises",
    zoneName: "Monolith Garden",
    positionX: "25%",
    positionY: "76%",
    labelSide: "right"
  }
];

export function MainHub({ recipientName, worldName }: MainHubProps): JSX.Element {
  const [selectedId, setSelectedId] = useState<(typeof hubSections)[number]["id"]>("games");
  const selectedSection = useMemo(
    () => hubSections.find((section) => section.id === selectedId) ?? hubSections[0],
    [selectedId]
  );
  const selectedNode = useMemo(
    () => portalNodes.find((node) => node.id === selectedId) ?? portalNodes[0],
    [selectedId]
  );

  return (
    <main className="world-map-page">
      <section className="world-map-shell">
        <header className="world-map-header">
          <p className="world-map-header__eyebrow">Expedition 33 Portal</p>
          <h1>Velkommen til {worldName}, {recipientName}</h1>
          <p>
            Du star i et Expedition 33-inspirert portalrom. Velg et markert punkt i kartet for a
            starte neste oppdrag.
          </p>
        </header>

        <section className="world-map-stage">
          <section className="world-map-canvas" aria-label={`${worldName} kart`}>
            {portalNodes.map((node) => {
              const section = hubSections.find((item) => item.id === node.id);
              if (!section) {
                return null;
              }

              const style = {
                "--portal-x": node.positionX,
                "--portal-y": node.positionY
              } as CSSProperties;

              return (
                <button
                  key={node.id}
                  type="button"
                  style={style}
                  className={`world-map-node world-map-node--${node.id} world-map-node--label-${node.labelSide} ${selectedId === node.id ? "is-active" : ""}`}
                  onClick={() => setSelectedId(node.id)}
                >
                  <span className="world-map-node__pin" />
                  <span className="world-map-node__label">
                    <span className="world-map-node__title">{section.title}</span>
                    <span className="world-map-node__zone">{node.zoneName}</span>
                  </span>
                </button>
              );
            })}
          </section>

          <section className="world-map-panel">
            <p className="world-map-panel__eyebrow">Valgt Destinasjon</p>
            <h2>{selectedSection.title}</h2>
            <p className="world-map-panel__location">{selectedNode.zoneName}</p>
            <p>{selectedSection.subtitle}</p>
            <ul>
              {selectedSection.ideas.map((idea) => (
                <li key={idea}>{idea}</li>
              ))}
            </ul>
            <button type="button">Apen {selectedSection.title.toLowerCase()}</button>
          </section>
        </section>
      </section>
    </main>
  );
}
