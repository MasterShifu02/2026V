# Ani Valentine Website

Dette prosjektet er satt opp med:
- React
- TypeScript
- Vite

Nettsiden har stjerner i bakgrunnen, tekst i front og blå pil/cursor.

## Rediger innhold
- Endre navn/tittel i `src/content/siteConfig.ts`
- Endre tekst og timing i `src/content/messages.ts`
- Endre escape room-gater og kupong i `src/content/escapeRoom.ts`
- Canvas-animasjon ligger i `src/hooks/useStarfieldAnimation.ts`
- Selve visningskomponenten ligger i `src/components/StarfieldCanvas.tsx`

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
