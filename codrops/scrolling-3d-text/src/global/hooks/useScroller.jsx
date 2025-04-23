import { useState, useMemo } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { useDebounce } from "@/global/hooks/useDebounce";

const useScroller = (ref) => {
  const { size } = useThree();
  const [vh, setVh] = useState(size.height);

  // Debounce the height value to avoid excessive re-renders
  const debouncedHeight = useDebounce(() => size.height, 100);

  // Function to get the positions of each section
  const getSectionInfo = (ref) => {
    const { children } = ref.current;
    const pos = [...Array(children.length)];
    [...children].forEach((child, i) => {
      const top = parseFloat(child.style.top);
      const height = parseFloat(child.offsetHeight);
      const bottom = Math.round(top + height);
      pos[i] = {
        top,
        height,
        bottom,
      };
    });

    return pos;
  };

  // Set positions for each section
  const sectionInfo = useMemo(() => {
    return getSectionInfo(ref);

    // vh is a necessary dependency to properly update
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vh, ref]);

  // Get current scroll info
  const getScrollData = (ref) => {
    const scrollTop = ref.current.scrollTop;
    const scrollBottom = scrollTop + vh;
    const section = sectionInfo.findIndex((sec) => sec.bottom >= scrollBottom);

    return {
      scrollTop: scrollTop,
      scrollBottom: scrollBottom,
      sectionInfo: sectionInfo,
      section: section,
    };
  };

  const [scrollData, setScrollData] = useState(getScrollData(ref));

  const updateScrollData = (ref, prevState) => {
    const { scrollTop, scrollBottom, sectionInfo, section } = getScrollData(ref);

    // Update ScrollData state only if the values have changed
    if (scrollTop !== prevState.scrollTop) {
      setScrollData({ ...prevState, scrollBottom, scrollTop });
    }
    if (sectionInfo !== prevState.sectionInfo) {
      setScrollData({ ...prevState, sectionInfo });
    }
    if (section !== prevState.section) {
      setScrollData({ ...prevState, section });
    }
  };

  useFrame(() => {
    if (debouncedHeight !== vh) {
      setVh(debouncedHeight);
    }

    updateScrollData(ref, scrollData);
  });

  return scrollData;
};

export default useScroller;
