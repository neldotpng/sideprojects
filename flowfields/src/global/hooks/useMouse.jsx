import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector2 } from "three";

// Can only be used inside Canvas
const useMouse = (normalized = true, maxDelta = 0.5) => {
  const { size } = useThree();

  const halfSizeVector = useRef(new Vector2(size.width, size.height).divideScalar(2));
  const zeroVector = useRef(new Vector2(0, 0));
  const lastPos = useRef(new Vector2());
  const maxDeltaVector = useRef(new Vector2(maxDelta, maxDelta));

  const mouseData = useRef({
    position: new Vector2(0, 0),
    velocity: new Vector2(0, 0),
    delta: new Vector2(0, 0),
  });

  useEffect(() => {
    halfSizeVector.current.set(size.width, size.height).divideScalar(2);
  }, [size]);

  useFrame(({ pointer }, dt) => {
    const { position, velocity, delta } = mouseData.current;

    const nPointer = normalized ? pointer : pointer.clone().addScalar(1).divideScalar(2);
    if (position.equals(nPointer) && !velocity.equals(zeroVector.current)) {
      delta.set(0, 0);
      velocity.set(0, 0);
      lastPos.current.set(position.x, position.y);
    } else if (!position.equals(nPointer)) {
      position.set(nPointer.x, nPointer.y);

      delta
        .subVectors(position, lastPos.current)
        .clamp(maxDeltaVector.current.clone().negate(), maxDeltaVector.current);
      velocity
        .set(delta.x, delta.y)
        .divideScalar(dt * 60)
        .multiply(halfSizeVector.current);

      lastPos.current.set(position.x, position.y);
    }
  });

  return mouseData;
};

export default useMouse;
