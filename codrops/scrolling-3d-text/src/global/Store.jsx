import { create } from "zustand";
import { createRef } from "react";

export const useScrollStore = create(() => ({
  scrollData: createRef(),
  lenis: createRef(),
}));
