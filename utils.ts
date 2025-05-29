import { Eggnemy, Egg, GameObject } from "./model";

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
