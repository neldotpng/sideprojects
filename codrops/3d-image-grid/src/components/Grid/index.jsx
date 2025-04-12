import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import ImageCard from "../ImageCard";

const Grid = ({ imageSize = 50, margins = 40, imageScale = 2, hoverRadius = 2 }) => {
  const { size } = useThree();
  const [colRows, setColRows] = useState([0, 0]);

  useEffect(() => {
    // Calculate # of Columns and Rows based on total image size incl. margins
    const col = Math.floor(size.width / (imageSize + margins));
    const row = Math.floor(size.height / (imageSize + margins));
    setColRows([col, row]);
  }, [size, imageSize, margins]);

  return (
    <ImageCard
      imageSize={imageSize} // Image Scale in px
      margins={margins} // Margins between images in px
      imageScale={imageScale}
      colRows={colRows} // Columns/Rows Pair
      hoverRadius={hoverRadius}
    />
  );
};

export default Grid;
