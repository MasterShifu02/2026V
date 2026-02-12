export type HubSection = {
  id: "games" | "quiz" | "surprises";
  title: string;
  subtitle: string;
  status: string;
  ideas: string[];
};

export const hubSections: HubSection[] = [
  {
    id: "games",
    title: "Spill",
    subtitle: "Ekspedisjonsutfordringer for oss to",
    status: "Planlagt",
    ideas: [
      "Memory-run med vare favorittbilder",
      "Refleks-spill: fang hjerter i tide",
      "Mini-ekspedisjon med valg og sma overraskelser"
    ]
  },
  {
    id: "quiz",
    title: "Quiz",
    subtitle: "Lumiere-test om oss, deg og minnene vare",
    status: "Planlagt",
    ideas: ["Hvor godt kjenner du oss?", "Fakta og minner fra reisen var", "Poeng + personlig sluttmelding"]
  },
  {
    id: "surprises",
    title: "Overraskelser",
    subtitle: "Skjulte funn fra Expedition 33-universet",
    status: "Planlagt",
    ideas: ["Last brev som apnes med kode", "Bildeslideshow med musikk", "Nedtelling til neste overraskelse"]
  }
];
