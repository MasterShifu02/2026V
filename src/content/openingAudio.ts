import { withBase } from "./basePath";

export const openingAudioConfig = {
  sharedPath: withBase("/audio/worlds/adi-expedition/opening/StartTheme.mp3"),
  volume: 0.46,
  warpWhooshPath: withBase("/audio/worlds/adi-expedition/opening/WarpWhoosh.wav"),
  warpWhooshVolume: 0.8
} as const;
