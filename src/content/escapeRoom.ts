export type EscapeRiddle = {
  id: string;
  question: string;
  hint: string;
  answers: string[];
};

export const escapeRiddles: EscapeRiddle[] = [
  {
    id: "first-date",
    question: "Hvilken dato var ble vi sammen? (format: DD.MM.AAAA)",
    hint: "Tips: skriv med punktum mellom dag, maned og ar.",
    answers: ["01.02.2023"]
  },
  {
    id: "where-first-date",
    question: "Hvor var våres første date?",
    hint: "Tips: Village.",
    answers: ["Kino"]
  },
  {
    id: "song",
    question: "Hvilken sang forbindes mest med oss?",
    hint: "Tips: bruk sangtittelen, ikke artistnavnet.",
    answers: ["Misty Mountains"]
  },
  {
    id: "nickname",
    question: "Hva er kallenavnet mitt pa deg?",
    hint: "Tips: det er navnet jeg bruker nar jeg er ekstra glad i deg.",
    answers: ["Sugarbomb", "SugarBomb"]
  },
  {
    id: "memory",
    question: "Hva var den forste filmen vi sa sammen?",
    hint: "Tips: skriv filmtittel.",
    answers: ["The Ridiculous 6"]
  }
];

export const escapeReward = {
  heading: "Du klarte det, min stjerne!",
  message: "Du rymte ut av det sorte hullet, og i handa di ligger inngangsbilletten.",
  ticketLabel: "INNGANGSBILLETT",
  ticketValue: "Gyldig for adgang til Adi Expedition 33"
} as const;
