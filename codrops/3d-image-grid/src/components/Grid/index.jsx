import { useEffect, useState } from "react";
import { useThree } from "@react-three/fiber";
import ImageCard from "../ImageCard";

const Grid = () => {
  const { size } = useThree();
  const [colRows, setColRows] = useState([0, 0]);

  const imageSize = 25;
  const margins = 25;

  useEffect(() => {
    // Calculate # of Columns and Rows based on total image size incl. margins
    const col = Math.floor(size.width / (imageSize + margins));
    const row = Math.floor(size.height / (imageSize + margins));
    setColRows([col, row]);
  }, [size]);

  return (
    <ImageCard
      imageSize={imageSize} // Image Scale in px
      margins={margins} // Margins between images in px
      colRows={colRows} // Columns/Rows Pair
      count={colRows[0] * colRows[1]} // Total Image Count
    />
  );
};

export default Grid;
