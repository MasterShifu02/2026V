import { withBase } from "../../../content/basePath";

export const mainHubAudioConfig = {
  tracks: [
    {
      title: "HovedTheme",
      path: withBase("/audio/worlds/adi-expedition/hovedside/HovedTheme.mp3")
    },
    {
      title: "HovedTheme2",
      path: withBase("/audio/worlds/adi-expedition/hovedside/HovedTheme2.mp3")
    }
  ],
  volume: 0.42
} as const;
