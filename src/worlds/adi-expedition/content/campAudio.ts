import { withBase } from "../../../content/basePath";

export const campAudioConfig = {
  hitSoundPath: withBase("/audio/worlds/adi-expedition/camp/hit.mp3"),
  missSoundPath: withBase("/audio/worlds/adi-expedition/camp/miss.mp3"),
  backgroundMusicPath: withBase("/audio/worlds/adi-expedition/camp/Camp.mp3")
} as const;
