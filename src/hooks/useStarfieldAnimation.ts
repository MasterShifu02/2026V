import { useEffect } from "react";
import type { RefObject } from "react";
import type { TimedMessage } from "../types/valentine";

type Star = {
  x: number;
  y: number;
  radius: number;
  hue: number;
  saturation: number;
  opacity: number;
};

type StarfieldOptions = {
  starCount?: number;
  hues?: number[];
  fadeFrames?: number;
  mobileBreakpoint?: number;
  onSequenceComplete?: () => void;
};

type StarfieldDefaults = Required<Omit<StarfieldOptions, "onSequenceComplete">>;

const DEFAULT_OPTIONS: StarfieldDefaults = {
  starCount: 500,
  hues: [0, 60, 240],
  fadeFrames: 250,
  mobileBreakpoint: 600
};

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createStars(width: number, height: number, starCount: number, hues: number[]): Star[] {
  return Array.from({ length: starCount }, () => {
    const hue = hues[randomInt(0, hues.length - 1)];
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2,
      hue,
      saturation: randomInt(50, 100),
      opacity: Math.random()
    };
  });
}

function updateStars(stars: Star[]): void {
  for (let i = 0; i < stars.length; i += 1) {
    if (Math.random() > 0.99) {
      stars[i].opacity = Math.random();
    }
  }
}

function drawStars(context: CanvasRenderingContext2D, stars: Star[]): void {
  for (let i = 0; i < stars.length; i += 1) {
    const star = stars[i];
    context.beginPath();
    context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    context.fillStyle = `hsla(${star.hue}, ${star.saturation}%, 88%, ${star.opacity})`;
    context.fill();
  }
}

function calculateOpacity(frame: number, start: number, fadeFrames: number, persistent: boolean): number {
  if (frame < start) {
    return 0;
  }

  if (persistent) {
    return Math.min((frame - start) / fadeFrames, 1);
  }

  if (frame < start + fadeFrames) {
    return (frame - start) / fadeFrames;
  }

  if (frame < start + fadeFrames * 2) {
    return 1 - (frame - (start + fadeFrames)) / fadeFrames;
  }

  return 0;
}

function drawMessageLines(
  context: CanvasRenderingContext2D,
  lines: string[],
  centerX: number,
  startY: number,
  fontSize: number
): void {
  const lineGap = 8;
  for (let i = 0; i < lines.length; i += 1) {
    context.fillText(lines[i], centerX, startY + i * (fontSize + lineGap));
  }
}

function drawMessages(
  context: CanvasRenderingContext2D,
  frame: number,
  width: number,
  height: number,
  messages: TimedMessage[],
  fadeFrames: number,
  mobileBreakpoint: number
): void {
  const fontSize = Math.min(30, width / 24);
  const isMobile = width < mobileBreakpoint;

  context.font = `${fontSize}px Comic Sans MS`;
  context.textAlign = "center";
  context.shadowColor = "rgba(45, 45, 255, 1)";
  context.shadowBlur = 8;
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;

  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    const alpha = calculateOpacity(frame, message.start, fadeFrames, message.persistent);
    if (alpha <= 0) {
      continue;
    }

    context.fillStyle = `rgba(45, 45, 255, ${alpha})`;
    const lines = isMobile ? message.mobile : message.desktop;
    drawMessageLines(context, lines, width / 2, height / 2 + message.yOffset, fontSize);
  }

  context.shadowColor = "transparent";
  context.shadowBlur = 0;
}

function getSequenceCompleteFrame(messages: TimedMessage[], fadeFrames: number): number {
  let completeFrame = 0;

  for (let i = 0; i < messages.length; i += 1) {
    const message = messages[i];
    const endFrame = message.persistent ? message.start + fadeFrames : message.start + fadeFrames * 2;
    if (endFrame > completeFrame) {
      completeFrame = endFrame;
    }
  }

  return completeFrame;
}

export function useStarfieldAnimation(
  canvasRef: RefObject<HTMLCanvasElement>,
  messages: TimedMessage[],
  options: StarfieldOptions = {}
): void {
  const starCount = options.starCount ?? DEFAULT_OPTIONS.starCount;
  const hues = options.hues ?? DEFAULT_OPTIONS.hues;
  const fadeFrames = options.fadeFrames ?? DEFAULT_OPTIONS.fadeFrames;
  const mobileBreakpoint = options.mobileBreakpoint ?? DEFAULT_OPTIONS.mobileBreakpoint;
  const onSequenceComplete = options.onSequenceComplete;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    let animationFrameId = 0;
    let frame = 0;
    let stars: Star[] = [];
    let hasNotifiedSequenceComplete = false;
    const sequenceCompleteFrame = getSequenceCompleteFrame(messages, fadeFrames);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars = createStars(canvas.width, canvas.height, starCount, hues);
    };

    const draw = () => {
      context.fillStyle = "#111";
      context.fillRect(0, 0, canvas.width, canvas.height);

      drawStars(context, stars);
      updateStars(stars);
      drawMessages(
        context,
        frame,
        canvas.width,
        canvas.height,
        messages,
        fadeFrames,
        mobileBreakpoint
      );

      if (!hasNotifiedSequenceComplete && frame >= sequenceCompleteFrame) {
        hasNotifiedSequenceComplete = true;
        onSequenceComplete?.();
      }

      frame += 1;
      animationFrameId = window.requestAnimationFrame(draw);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    animationFrameId = window.requestAnimationFrame(draw);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [canvasRef, fadeFrames, hues, messages, mobileBreakpoint, onSequenceComplete, starCount]);
}
