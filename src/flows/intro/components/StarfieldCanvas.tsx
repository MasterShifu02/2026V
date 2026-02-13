import { useRef } from "react";
import type { TimedMessage } from "../types/timedMessage";
import { useStarfieldAnimation } from "../hooks/useStarfieldAnimation";

type StarfieldCanvasProps = {
  messages: TimedMessage[];
  onSequenceComplete?: () => void;
};

export function StarfieldCanvas({ messages, onSequenceComplete }: StarfieldCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useStarfieldAnimation(canvasRef, messages, { onSequenceComplete });

  return <canvas id="starfield" ref={canvasRef} />;
}
