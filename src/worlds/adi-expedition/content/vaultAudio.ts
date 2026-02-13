import { withBase } from "../../../content/basePath";

export const vaultAudioConfig = {
  firstLinePath: withBase("/audio/worlds/adi-expedition/vault/nevron1.mp3"),
  finalLinePath: withBase("/audio/worlds/adi-expedition/vault/nevron2.mp3")
} as const;
