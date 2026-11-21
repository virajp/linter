// valid.ts - should produce zero errors
export function add(a: number, b: number): number {
  return a + b;
}

export const result: number = add(1, 2);

// Modern syntax: each line uses a feature that a parser update can break.
export interface Shape {
  readonly kind: "circle" | "square";
  size: number;
}

export type Area<T extends Shape> = T extends { kind: "circle" } ? number : number;

export enum Color {
  Red = "red",
  Green = "green",
}

export abstract class Base<T> {
  protected constructor(public readonly value: T) {}

  abstract describe(): string;
}

export class Box extends Base<number> {
  override describe(): string {
    return `Box(${this.value})`;
  }
}

export const palette = {
  primary: Color.Red,
  secondary: Color.Green,
} as const satisfies Record<string, Color>;

export function assertIsString(value: unknown): asserts value is string {
  if (typeof value !== "string") {
    throw new TypeError("not a string");
  }
}

export function first<const T extends readonly unknown[]>(items: T): T[0] {
  return items[0];
}

export type Keys = keyof typeof palette;
export type Upper = `${Uppercase<Keys>}_COLOR`;

export function useResource(): number {
  using handle = { [Symbol.dispose]: () => {} };
  return handle ? 1 : 0;
}
