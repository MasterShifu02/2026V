# Adi Expedition Struktur

Dette er mappen for alt som gjelder hovedverdenen `Adi Expedition 33`.

## Filer du bruker mest

- `src/worlds/adi-expedition/components/MainHub.tsx`: hovedsiden med kart og valg av destinasjoner.
- `src/worlds/adi-expedition/components/TicketGateScene.tsx`: scenen i tomt univers der billetten brukes.
- `src/worlds/adi-expedition/components/CampMission.tsx`: Camp-siden med Esquie-bilde.
- `src/worlds/adi-expedition/components/BadunkadunkVaultMission.tsx`: neste spill-side med Nevron-bilde.
- `src/worlds/adi-expedition/content/hubSections.ts`: innholdet for spill/quiz/overraskelser.
- `src/worlds/adi-expedition/content/campAudio.ts`: lydstier for Camp (riktig/feil trykk).
- `src/worlds/adi-expedition/content/vaultAudio.ts`: lydsti for Nevron-dialog.
- `src/worlds/adi-expedition/styles.css`: all CSS for Adi Expedition-verdenen.
- `public/images/worlds/adi-expedition/map.png`: kartbakgrunnen for hovedsiden.
- `public/images/worlds/adi-expedition/Nevron.png`: bilde for Badunkadunk Vault (kan ogsa vaere `nevron.*`).
- `public/audio/worlds/adi-expedition/camp/`: legg inn `hit.mp3` og `miss.mp3` her.
- `public/audio/worlds/adi-expedition/vault/`: legg inn `talk.mp3` for "Snakke med Nevron".

## Entry point

- `src/worlds/adi-expedition/index.ts` eksporterer komponenter brukt i `src/App.tsx`.
