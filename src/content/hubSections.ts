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
    subtitle: "Små spill med personlig tema",
    status: "Planlagt",
    ideas: ["Memory-spill med våre bilder", "Klikk-og-fang hjerter", "Mini story-spill med valg"]
  },
  {
    id: "quiz",
    title: "Quiz",
    subtitle: "Spørsmål om oss og Ani",
    status: "Planlagt",
    ideas: ["Hvor godt kjenner du oss?", "Morsomme fakta-spørsmål", "Poeng + personlig avslutning"]
  },
  {
    id: "surprises",
    title: "Overraskelser",
    subtitle: "Skjulte meldinger og små gaver",
    status: "Planlagt",
    ideas: ["Låst brev som åpnes med kode", "Bildeslideshow med musikk", "Nedtelling til neste overraskelse"]
  }
];
