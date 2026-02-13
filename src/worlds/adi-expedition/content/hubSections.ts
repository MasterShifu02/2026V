export type HubSection = {
  id: "games" | "quiz" | "surprises";
  title: string;
  zoneName: string;
  stoneName: string;
  status: string;
};

export const hubSections: HubSection[] = [
  {
    id: "games",
    title: "Camp",
    zoneName: "Camp Outskirts",
    stoneName: "Aether Stone",
    status: "Ikke fullfort"
  },
  {
    id: "quiz",
    title: "Badunkadunk Vault",
    zoneName: "Lumiere Arkiv",
    stoneName: "Chrono Stone",
    status: "Ikke fullfort"
  },
  {
    id: "surprises",
    title: "Francois Throne",
    zoneName: "Rift Citadel",
    stoneName: "Siste oppgjor",
    status: "Last"
  }
];
