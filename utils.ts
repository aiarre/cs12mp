import { Eggnemy, Egg, Boss, GameObject, Direction } from "./model";
import { Match } from "effect";

export function getCenterX(obj: GameObject) {
  return Math.round(obj.x + obj.width / 2);
}
export function getCenterY(obj: GameObject) {
  return Math.round(obj.y + obj.height / 2);
}
export function getCenterXY(obj: GameObject): [number, number] {
  return [getCenterX(obj), getCenterY(obj)];
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

export function isColliding(
  x: number,
  y: number,
  enemy: Eggnemy | Boss,
  others: (Eggnemy | Boss)[],
): boolean {
  return others.some((other) => {
    if (other === enemy) return false;
    return isTouching({ ...enemy, x, y }, other);
  });
}

export function moveEnemyTowardsEgg(
  enemy: Eggnemy | Boss,
  egg: Egg,
  others: (Eggnemy | Boss)[],
): Eggnemy | Boss {
  const dx = egg.x - enemy.x;
  const dy = egg.y - enemy.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist === 0) return enemy;

  const moveX = Math.ceil(enemy.x + (dx / dist) * enemy.speed);
  const moveY = Math.ceil(enemy.y + (dy / dist) * enemy.speed);

  const tryMoveX = !isColliding(moveX, enemy.y, enemy, others);
  const tryMoveY = !isColliding(enemy.x, moveY, enemy, others);

  return {
    ...enemy,
    // Round up so that eggnemies will always move
    x: tryMoveX ? moveX : enemy.x,
    y: tryMoveY ? moveY : enemy.y,
  };
}

export function getDirectionFromKey(key: string): Direction | null {
  return Match.value(key).pipe(
    Match.when(
      (key) => key.toLowerCase() === "w" || key === "ArrowUp",
      () => "NORTH",
    ),
    Match.when(
      (key) => key.toLowerCase() === "s" || key === "ArrowDown",
      () => "SOUTH",
    ),
    Match.when(
      (key) => key.toLowerCase() === "a" || key === "ArrowLeft",
      () => "WEST",
    ),
    Match.when(
      (key) => key.toLowerCase() === "d" || key === "ArrowRight",
      () => "EAST",
    ),
    Match.orElse(() => null),
  ) as Direction | null;
}

export function getDxDyMultiplierFromDirection(
  direction: Direction,
): [-1 | 0 | 1, -1 | 0 | 1] {
  return Match.value(direction).pipe(
    Match.when("NORTH", () => [0, -1]),
    Match.when("SOUTH", () => [0, 1]),
    Match.when("WEST", () => [-1, 0]),
    Match.when("EAST", () => [1, 0]),
    Match.when("NONE", () => [0, 0]),
    Match.exhaustive,
  ) as [-1 | 0 | 1, -1 | 0 | 1];
}

export function keepEgghancementOpen(exp: number, cost: number): boolean {
  return exp - cost >= cost;
}
