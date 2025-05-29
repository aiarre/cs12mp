import { Eggnemy, Egg, GameObject } from "./model";

export function spawnEggnemies(count: number): Eggnemy[] {
  return Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 700),
    y: Math.floor(Math.random() * 500),
    width: 20,
    height: 20,
    speed: 10,
  }));
}

export function isTouching(a: GameObject, b: GameObject): boolean {
  return (
    a.x <= b.x ||
    b.x + b.width <= a.x + a.width ||
    a.y <= b.y ||
    b.y + b.height <= a.y + a.height
  );
}

export function isWithinRange(egg: Egg, en: Eggnemy): boolean {
  const dx = egg.x - en.x;
  const dy = egg.y - en.y;
  return dx * dx + dy * dy <= egg.attackRange * egg.attackRange;
}
