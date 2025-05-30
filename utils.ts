import { Eggnemy, Egg, GameObject } from "./model";

export function getCenterXY(obj: GameObject): [number, number] {
  return [
    Math.round(obj.x + obj.width / 2), // x
    Math.round(obj.y + obj.height / 2), // y
  ];
}

export function isTouching(a: GameObject, b: GameObject): boolean {
  return !(
    a.x + a.width < b.x ||
    a.x > b.x + b.width ||
    a.y + a.height < b.y ||
    a.y > b.y + b.height
  );
}

export function isWithinRange(egg: Egg, en: Eggnemy): boolean {
  const dx = egg.x - en.x;
  const dy = egg.y - en.y;
  return dx * dx + dy * dy <= egg.attackRange * egg.attackRange;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}
