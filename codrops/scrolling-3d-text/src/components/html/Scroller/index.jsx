import { useEffect } from "react";
import cx from "./scroller.module.scss";
import { debounce } from "@/global/hooks/useDebounce";

// Sections Prop is an array of numbers representing section heights in vh units
const Scroller = ({ ref, sections = [100] }) => {
  useEffect(() => {
    // Function to handle the resize event
    // This function will set the top position of each section based on its height
    const handleResize = debounce(() => {
      const { innerHeight } = window;
      let totalHeight = 0;

      sections.forEach((section, i) => {
        ref.current.children[i].style.top = i === 0 ? `0px` : `${totalHeight}px`;
        totalHeight += (section / 100) * innerHeight;
      });
    }, 100);

    // Set the top position of each section on initial load
    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref, sections]);

  return (
    <div
      id="scroller"
      className={cx.scroller}
      ref={ref}>
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
  );
};

export default Scroller;
