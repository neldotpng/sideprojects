import { useEffect, useRef } from "react";
import Lenis from "lenis";

import { debounce } from "@/global/hooks/useDebounce";
import cx from "./scroller.module.scss";

// Component for a smooth scrolling overlay that sits on top of the 3D scene
// Implements Lenis for smooth scrolling
// Sections Prop is an array of numbers representing section heights in vh units
const Scroller = ({ wrapperRef, lenisRef, sections = [100] }) => {
  const contentRef = useRef();

  useEffect(() => {
    // Function to handle the resize event
    // This function will set the top position of each section based on its height
    const handleResize = debounce(() => {
      const { innerHeight } = window;
      let totalHeight = 0;

      sections.forEach((section, i) => {
        contentRef.current.children[i].dataset.top = i === 0 ? 0 : totalHeight;
        totalHeight += (section / 100) * innerHeight;
      });
    }, 100);

    // Set the top position of each section on initial load
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [wrapperRef, sections]);

  // Initialize Lenis for smooth scrolling
  useEffect(() => {
    if (!wrapperRef.current) return;

    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      smooth: true,
      lerp: 0.1,
      infinite: true,
    });

    lenisRef.current = lenis;

    return () => {
      lenis.destroy();
    };
  }, [wrapperRef, lenisRef]);

  return (
    <div
      id="scroller"
      className={cx.scroller}
      ref={wrapperRef}>
      <div ref={contentRef}>
        {sections.map((section, index) => (
          <div
            key={index}
            className={cx.scrollerElement}
            style={{
              height: `${section}vh`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Scroller;
