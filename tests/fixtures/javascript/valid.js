// valid.js - should produce zero errors
export function greet(name) {
  return `Hello, ${name}`;
}

export const message = greet("world");

// Modern syntax: each line uses a feature that a parser update can break.
export class Counter {
  #count = 0;
  static #instances = 0;

  static {
    Counter.#instances = 0;
  }

  increment(step = 1) {
    this.#count += step;
    Counter.#instances ||= 1;
    return this.#count;
  }

  get value() {
    return this.#count;
  }

  static get instances() {
    return Counter.#instances;
  }
}

export async function* pages(fetchPage) {
  for await (const page of fetchPage()) {
    yield page?.items ?? [];
  }
}

export const config = await Promise.resolve({ retries: 3 });
export const pattern = /(?<year>\d{4})-(?<month>\d{2})/v;
export const big = 1_000_000n;
export const { retries, ...rest } = { ...config, delay: 10 };
export const last = [1, 2, 3].at(-1);
export const settings = await import("./data.json", { with: { type: "json" } });
