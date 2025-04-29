import { create } from "zustand";
import { createRef } from "react";

export const useScrollStore = create(() => ({
  scrollData: createRef(),
  lenis: createRef(),
}));

export const useMouseStore = create(() => ({
  mousePos: createRef(),
}));

export const usePingPongStore = create(() => ({
  pingPongTexture: createRef(),
}));
