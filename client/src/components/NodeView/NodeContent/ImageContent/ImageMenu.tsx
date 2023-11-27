import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { useRecoilValue } from "recoil";
import { currentNodeState } from "~/global/Atoms";
import "./ImageMenu.scss";
import { useState } from "react";

export interface IImageMenuProps {
  setResizeHeight: (height: number) => void;
  setResizeWidth: (width: number) => void;
}

/** The menu for an Image Node, used for cropping an image */
export const ImageMenu = (props: IImageMenuProps) => {
  const { setResizeHeight, setResizeWidth } = props;
  const currentNode = useRecoilValue(currentNodeState);
  const format = (val: string) => val + "px";
  const parse = (val: string) => val.replace(/px$/, "");
  const [height, setHeight] = useState(currentNode.height);
  const [width, setWidth] = useState(currentNode.width);

  return (
    <div id="imageMenu">
      <button
        className="imageMenuButton"
        onClick={() => {
          if (currentNode.defHeight && currentNode.defWidth) {
            setResizeHeight(currentNode.defHeight);
            setResizeWidth(currentNode.defWidth);
            setHeight(currentNode.defHeight);
            setWidth(currentNode.defWidth);
          }
        }}
      >
        Reset Crop
      </button>
      {/* height number input */}
      <NumberInput
        defaultValue={currentNode.height}
        min={10}
        max={currentNode.defHeight}
        step={5}
        precision={2}
        onChange={(valueString: string) => {
          const h = parse(valueString);
          setResizeHeight(parseInt(h));
          setHeight(parseInt(h));
        }}
        value={height ? format(Math.floor(height).toString()) : "px"}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      {/* width number input */}
      <NumberInput
        defaultValue={currentNode.width}
        min={10}
        max={currentNode.defWidth}
        step={5}
        precision={2}
        onChange={(valueString: string) => {
          const w = parse(valueString);
          setResizeWidth(parseInt(w));
          setWidth(parseInt(w));
        }}
        value={width ? format(Math.floor(width).toString()) : "px"}
      >
        <NumberInputField />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </div>
  );
};
