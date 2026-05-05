import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const appFocusMock = vi.hoisted(() => vi.fn());
const shellOpenExternalMock = vi.hoisted(() => vi.fn());

vi.mock("electron", () => ({
  BrowserWindow: class BrowserWindow {},
  app: {
    focus: appFocusMock,
  },
  shell: {
    openExternal: shellOpenExternalMock,
  },
}));

import { ensureWindowVisible } from "../../src/main/runtime.js";

type FakeWindow = {
  focus: ReturnType<typeof vi.fn>;
  isDestroyed: () => boolean;
  isMinimized: () => boolean;
  isVisible: () => boolean;
  restore: ReturnType<typeof vi.fn>;
  setWindowButtonVisibility: ReturnType<typeof vi.fn>;
  show: ReturnType<typeof vi.fn>;
};

const originalPlatform = process.platform;

function setPlatform(value: NodeJS.Platform): void {
  Object.defineProperty(process, "platform", {
    configurable: true,
    value,
  });
}

function makeWindow(overrides: Partial<FakeWindow> = {}): FakeWindow {
  return {
    focus: vi.fn(),
    isDestroyed: () => false,
    isMinimized: () => false,
    isVisible: () => false,
    restore: vi.fn(),
    setWindowButtonVisibility: vi.fn(),
    show: vi.fn(),
    ...overrides,
  };
}

beforeEach(() => {
  appFocusMock.mockReset();
  shellOpenExternalMock.mockReset();
  setPlatform(originalPlatform);
});

afterEach(() => {
  setPlatform(originalPlatform);
});

describe("ensureWindowVisible", () => {
  it("activates the app on macOS when making the window visible", () => {
    setPlatform("darwin");
    const window = makeWindow({ isMinimized: () => true, isVisible: () => false });

    ensureWindowVisible(window as never);

    expect(window.restore).toHaveBeenCalledTimes(1);
    expect(window.show).toHaveBeenCalledTimes(1);
    expect(window.focus).toHaveBeenCalledTimes(1);
    expect(appFocusMock).toHaveBeenCalledWith({ steal: true });
  });

  it("does not steal focus on non-macOS platforms", () => {
    setPlatform("linux");
    const window = makeWindow({ isVisible: () => true });

    ensureWindowVisible(window as never);

    expect(window.show).not.toHaveBeenCalled();
    expect(window.focus).toHaveBeenCalledTimes(1);
    expect(appFocusMock).not.toHaveBeenCalled();
  });
});
