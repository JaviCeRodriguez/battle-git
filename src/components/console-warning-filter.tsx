"use client";

const marker = "__battleGitConsoleWarningFilterInstalled";
const runtime = globalThis as typeof globalThis & {
  [marker]?: boolean;
};

if (typeof window !== "undefined" && !runtime[marker]) {
  runtime[marker] = true;
  const originalWarn = console.warn.bind(console);

  console.warn = (...args: unknown[]) => {
    const message = args[0];

    if (
      typeof message === "string" &&
      message.includes("THREE.Clock: This module has been deprecated")
    ) {
      return;
    }

    originalWarn(...args);
  };
}

export function ConsoleWarningFilter() {
  return null;
}
