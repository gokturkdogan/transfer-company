import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";

import {
  GlobalLoaderProvider,
  useGlobalLoader,
} from "@/components/shared/global-loader-provider";

function wrapper({ children }: { children: ReactNode }) {
  return (
    <GlobalLoaderProvider defaultMessage="Please wait">
      {children}
    </GlobalLoaderProvider>
  );
}

describe("GlobalLoaderProvider", () => {
  it("tracks nested show/hide with reference counting", () => {
    const { result } = renderHook(() => useGlobalLoader(), { wrapper });

    expect(result.current.isActive).toBe(false);

    act(() => {
      result.current.show();
      result.current.show("Saving...");
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.hide();
    });
    expect(result.current.isActive).toBe(true);

    act(() => {
      result.current.hide();
    });
    expect(result.current.isActive).toBe(false);
  });

  it("withLoader shows during work and hides afterward", async () => {
    const { result } = renderHook(() => useGlobalLoader(), { wrapper });

    let resolveWork: (() => void) | undefined;
    const work = new Promise<string>((resolve) => {
      resolveWork = () => resolve("done");
    });

    let settled: string | undefined;
    act(() => {
      void result.current.withLoader(async () => work).then((value) => {
        settled = value;
      });
    });

    expect(result.current.isActive).toBe(true);

    await act(async () => {
      resolveWork?.();
      await work;
    });

    expect(settled).toBe("done");
    expect(result.current.isActive).toBe(false);
  });
});
