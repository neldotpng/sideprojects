import { useRef, useEffect, useState } from "react";
import { useBrowserLocation } from "wouter/use-browser-location";
import { useFrame } from "@react-three/fiber";
import gsap from "gsap";

const Route = ({
  path,
  transitionDuration = 2.5,
  transitionEase = "power2.inOut",
  transitionIn = (progress) => {
    console.log(progress);
  },
  transitionOut = (progress) => {
    console.log(progress);
  },
  setVisibility = true,
  children,
  ...props
}) => {
  // History
  const [location] = useBrowserLocation();
  const outRoute = useRef(location);
  const inRoute = useRef(location);

  // Visible State
  const [visible, setVisible] = useState(true);

  // Updating TransitionState Ref
  const transitionState = useRef({
    direction: "NONE", // "IN" || "OUT" || "NONE"
    started: false, // boolean
    progress: 0, // number 0-1
    ended: false, // boolean
  });

  useEffect(() => {
    // Set inRoute
    inRoute.current = location;

    // Set direction of transition based on inRoute and outRoute
    const direction = path === inRoute.current ? "IN" : path === outRoute.current ? "OUT" : "NONE";

    // If setVisibility, update visible state
    if (setVisibility) setVisible(path === inRoute.current || path === outRoute.current);

    if (direction !== "NONE") {
      // Reset ended state
      transitionState.current.ended = false;

      // Progress Tween
      gsap.fromTo(
        transitionState.current,
        {
          progress: 0,
        },
        {
          progress: 1,
          duration: transitionDuration,
          ease: transitionEase,
          onStart: () => {
            transitionState.current.started = true;
            transitionState.current.direction = direction;
          },
          onComplete: () => {
            transitionState.current.ended = true;
            transitionState.current.direction = "NONE";
          },
        }
      );
    }

    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      gsap.killTweensOf(transitionState.current);
      outRoute.current = location;
    };
  }, [location, path, transitionDuration, transitionEase, setVisibility]);

  useFrame(() => {
    if (transitionState.current.ended) return;

    if (transitionState.current.direction === "IN") {
      transitionIn(transitionState.current.progress);
    }

    if (transitionState.current.direction === "OUT") {
      transitionOut(transitionState.current.progress);
    }
  });

  return (
    <group
      {...props}
      visible={visible}>
      {children}
    </group>
  );
};

export default Route;
