import { Eggnemy, Egg } from "./model";

export function spawnEggnemies(count: number): Eggnemy[] {
  return Array.from({ length: count }, () => ({
    x: Math.floor(Math.random() * 700),
    y: Math.floor(Math.random() * 500),
    width: 20,
    height: 20,
    speed: 10,
  }));
}

export function isTouching(egg: Egg, en: Eggnemy): boolean {
  return !(
    egg.x + egg.width < en.x ||
    egg.x > en.x + en.width ||
    egg.y + egg.height < en.y ||
    egg.y > en.y + en.height
  );
}

export function isWithinRange(egg: Egg, en: Eggnemy): boolean {
  const dx = egg.x - en.x;
  const dy = egg.y - en.y;
  return dx * dx + dy * dy <= egg.attackRange * egg.attackRange;
}
