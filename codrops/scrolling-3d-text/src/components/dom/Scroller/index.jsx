// import { useEffect } from "react";
// import { debounce } from "@/global/hooks/useDebounce";

import { useScroll } from "@react-three/drei";
import cx from "./scroller.module.scss";
import { useFrame } from "@react-three/fiber";

// Sections Prop is an array of numbers representing section heights in vh units
const Scroller = ({ sections = [100] }) => {
  return (
    <div
      id="scroller"
      className={cx.scroller}>
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
