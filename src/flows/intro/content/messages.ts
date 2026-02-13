import type { TimedMessage } from "../types/timedMessage";

type MessageTemplate = Omit<TimedMessage, "desktop" | "mobile"> & {
  desktopTemplate: string[];
  mobileTemplate: string[];
};

const MESSAGE_TEMPLATES: MessageTemplate[] = [
  {
    start: 0,
    yOffset: 0,
    desktopTemplate: ["everyday day I cannot believe how lucky I am"],
    mobileTemplate: ["everyday day I cannot believe how lucky I am"],
    persistent: false
  },
  {
    start: 500,
    yOffset: 0,
    desktopTemplate: ["amongst trillions and trillions of stars, over billions of years"],
    mobileTemplate: ["amongst trillions and trillions of stars,", "over billions of years"],
    persistent: false
  },
  {
    start: 1000,
    yOffset: 0,
    desktopTemplate: ["to be alive, and to get to spend this life with you"],
    mobileTemplate: ["to be alive, and to get to spend this life with you"],
    persistent: false
  },
  {
    start: 1500,
    yOffset: 0,
    desktopTemplate: ["is so incredibly, unfathomably unlikely"],
    mobileTemplate: ["is so incredibly, unfathomably unlikely"],
    persistent: false
  },
  {
    start: 2000,
    yOffset: 0,
    desktopTemplate: ["and yet here I am to get the impossible chance to get to know you"],
    mobileTemplate: ["and yet here I am to get the impossible", "chance to get to know you"],
    persistent: false
  },
  {
    start: 2500,
    yOffset: 0,
    desktopTemplate: ["I love you so much {name}, more than all the time and space in the universe can contain"],
    mobileTemplate: ["I love you so much {name}, more than", "all the time and space in the universe can contain"],
    persistent: true
  },
  {
    start: 2750,
    yOffset: 60,
    desktopTemplate: ["and I can't wait to spend all the time in the world to share that love with you!"],
    mobileTemplate: ["and I can't wait to spend all the time in", "the world to share that love with you!"],
    persistent: true
  },
  {
    start: 3000,
    yOffset: 120,
    desktopTemplate: ["Happy Valentine's Day <3"],
    mobileTemplate: ["Happy Valentine's Day <3"],
    persistent: true
  }
];

function replaceName(line: string, name: string): string {
  return line.replace(/\{name\}/g, name);
}

export function createMessages(name: string): TimedMessage[] {
  return MESSAGE_TEMPLATES.map((template) => ({
    start: template.start,
    yOffset: template.yOffset,
    persistent: template.persistent,
    desktop: template.desktopTemplate.map((line) => replaceName(line, name)),
    mobile: template.mobileTemplate.map((line) => replaceName(line, name))
  }));
}
