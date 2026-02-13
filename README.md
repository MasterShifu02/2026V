# Ani Valentine Website

Dette prosjektet er satt opp med:
- React
- TypeScript
- Vite

Nettsiden har stjerner i bakgrunnen, tekst i front og blå pil/cursor.

## Prosjektstruktur

Koden er delt i moduler så det er lett å finne riktig del:

- `src/flows/intro`: introsekvensen med stjerner, tekst og warp-overgang.
- `src/flows/escape-room`: black hole + gåter + ferdigmelding.
- `src/worlds/adi-expedition`: hovedverdenen (kart, destinasjoner og billett-port).
- `src/content/siteConfig.ts`: global konfig for navn, ruter og titler.
- `public/images/worlds/adi-expedition/map.png`: kartbildet for hovedverdenen.

## Rediger innhold
- Endre navn/tittel i `src/content/siteConfig.ts`
- Endre tekst og timing i `src/flows/intro/content/messages.ts`
- Endre escape room-gater og kupong i `src/flows/escape-room/content/escapeRoom.ts`
- Canvas-animasjon ligger i `src/flows/intro/hooks/useStarfieldAnimation.ts`
- Selve visningskomponenten ligger i `src/flows/intro/components/StarfieldCanvas.tsx`
- Hovedsiden/kartet ligger i `src/worlds/adi-expedition/components/MainHub.tsx`

## Kjør lokalt med npm
1. Installer avhengigheter:
```bash
npm install
```

2. Start utviklingsserver:
```bash
npm run dev
```

3. Åpne URL-en som vises i terminalen (vanligvis `http://localhost:5173`).

## Bygg produksjonsversjon
```bash
npm run build
```

## Type-sjekk
```bash
npm run typecheck
```
