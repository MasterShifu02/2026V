import { useRef } from "react";
import type { TimedMessage } from "../types/valentine";
import { useStarfieldAnimation } from "../hooks/useStarfieldAnimation";

type StarfieldCanvasProps = {
  messages: TimedMessage[];
};

export function StarfieldCanvas({ messages }: StarfieldCanvasProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useStarfieldAnimation(canvasRef, messages);

  return <canvas id="starfield" ref={canvasRef} />;
}
