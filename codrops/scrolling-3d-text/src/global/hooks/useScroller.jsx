import { useState, useMemo, useRef, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useDebounce } from "@/global/hooks/useDebounce";

// Can only be used inside Canvas
const useScroller = (ref, reactive = false) => {
  const { size } = useThree();

  const [vh, setVh] = useState(size.height);
  const [scrollState, setScrollState] = useState({});

  // Debounce the height value to avoid excessive re-renders
  const debouncedHeight = useDebounce(() => size.height, 100);

  // Function to get the positions of each section
  const getSectionInfo = useCallback(() => {
    const { children } = ref.current;
    const scrollSections = children[0].querySelectorAll("div[data-top]");
    return [...scrollSections].map((child) => {
      const top = child.dataset.top ? parseFloat(child.dataset.top) : 0;
      const height = parseFloat(child.offsetHeight);
      const bottom = Math.round(top + height);
      return { top, height, bottom };
    });
  }, [ref]);

  // Set positions for each section
  const sectionInfo = useMemo(() => {
    return getSectionInfo();
    // vh is a necessary dependency to properly update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh, getSectionInfo]);

  // Get current scroll info
  // Logic assumes sections are measured by the bottom of the viewport
  const getScrollData = (ref) => {
    // Get the scrollTop, scrollHeight, and offsetHeight of the scroller
    const { scrollTop, scrollHeight, offsetHeight } = ref.current;

    // Scroll position at the bottom of the viewport
    const scrollBottom = scrollTop + vh;
    // Total scroll progress
    const progress = scrollTop / (scrollHeight - offsetHeight);
    // Current section based on the scroll position
    const section = sectionInfo.findIndex((sec) => sec.bottom >= scrollBottom);

    // Section scroll progress
    // Different calculations needed for the first index MAYBE REMOVE?
    // Starting above 0 is technically correct
    const sectionOffset = section !== 0 ? offsetHeight : 0;
    const sectionHeightOffset = section === 0 ? offsetHeight : 0;
    const sectionData = sectionInfo[section] || { top: 0, height: 1 };
    const sectionProgress =
      (scrollTop + sectionOffset - sectionData.top) / (sectionData.height - sectionHeightOffset);

    return {
      scrollBottom: scrollBottom,
      progress: progress,
      sectionProgress: sectionProgress,
      section: section,
      sectionInfo: sectionInfo,
    };
  };

  const scrollData = useRef(getScrollData(ref));

  const updateScrollData = (ref, prevState) => {
    const { scrollBottom, progress, sectionProgress, section, sectionInfo } = getScrollData(ref);

    // Update ScrollData state only if the values have changed
    if (scrollBottom !== prevState.scrollBottom) {
      scrollData.current = { ...prevState, scrollBottom, progress, sectionProgress };
    }
    if (sectionInfo !== prevState.sectionInfo) {
      scrollData.current = { ...prevState, sectionInfo };
    }
    if (section !== prevState.section) {
      scrollData.current = { ...prevState, section };
    }
  };

  useFrame(() => {
    if (debouncedHeight !== vh) {
      setVh(debouncedHeight);
    }

    updateScrollData(ref, scrollData.current);

    if (reactive) setScrollState(scrollData.current);
  });

  return reactive ? scrollState : scrollData;
};

export default useScroller;
