declare module "@formkit/auto-animate/react" {
  import type { RefCallback } from "react";
  export function useAutoAnimate(
    options?: unknown,
  ): [RefCallback<HTMLElement | null>, (enabled: boolean) => void];
}
