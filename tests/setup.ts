import "@testing-library/jest-dom";

// Node's built-in `localStorage` global shadows jsdom's working implementation
// with a non-functional stub when no `--localstorage-file` is configured.
// Polyfill `window.localStorage` with an in-memory Storage so persistence
// (e.g. saved locale preference) behaves correctly in tests.
if (typeof window !== "undefined" && typeof window.localStorage?.getItem !== "function") {
  class MemoryStorage implements Storage {
    private store = new Map<string, string>();

    get length(): number {
      return this.store.size;
    }

    clear(): void {
      this.store.clear();
    }

    getItem(key: string): string | null {
      return this.store.has(key) ? this.store.get(key)! : null;
    }

    key(index: number): string | null {
      return Array.from(this.store.keys())[index] ?? null;
    }

    removeItem(key: string): void {
      this.store.delete(key);
    }

    setItem(key: string, value: string): void {
      this.store.set(key, String(value));
    }
  }

  Object.defineProperty(window, "localStorage", {
    value: new MemoryStorage(),
    configurable: true,
  });
}
