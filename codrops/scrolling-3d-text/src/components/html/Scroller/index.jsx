import { useEffect } from "react";
import cx from "./scroller.module.scss";
import { debounce } from "@/global/hooks/useDebounce";

const Scroller = ({ ref, sections = [] }) => {
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
            backgroundColor: `hsla(${(index * 360) / sections.length}, 100%, 50%, 0.25)`,
          }}
        />
      ))}
    </div>
  );
};

export default Scroller;
