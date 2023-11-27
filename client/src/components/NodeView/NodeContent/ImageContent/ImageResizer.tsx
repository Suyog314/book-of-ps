import {
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { currentNodeState, refreshState } from "~/global/Atoms";
import { FrontendNodeGateway } from "~/nodes";
import { INodeProperty, makeINodeProperty } from "~/types";
import { Button } from "../../../Button";
import "./ImageResizer.scss";

export interface ImageResizerProps {
  height: number | undefined;
  width: number | undefined;
  setHeight: any;
  setWidth: any;
}
const ImageResizer = (props: ImageResizerProps) => {
  const { height, width, setHeight, setWidth } = props;
  const [currentNode] = useRecoilState(currentNodeState);
  const [refresh, setRefresh] = useRecoilState(refreshState);

  //updates the image dimensions when the height and width are changed
  useEffect(() => {
    const updateNode = async () => {
      if (currentNode.height && currentNode.width) {
        let nodeProperty: INodeProperty = makeINodeProperty("height", [
          currentNode.height[0],
          height,
        ]);
        await FrontendNodeGateway.updateNode(currentNode.nodeId, [
          nodeProperty,
        ]);
        nodeProperty = makeINodeProperty("width", [
          currentNode.width[0],
          width,
        ]);
        await FrontendNodeGateway.updateNode(currentNode.nodeId, [
          nodeProperty,
        ]);
      }
    };
    updateNode();
    setRefresh(!refresh);
  }, [height, width]);

  //ensures state refers to currentNode height
  useEffect(() => {
    currentNode.height && setHeight(currentNode.height[1]);
    currentNode.width && setWidth(currentNode.width[1]);
  }, [currentNode]);

  //called by eventhandlers to change height
  const handleHeightChange = (value: number) => {
    setHeight(value);
    console.log(height);
  };
  //called by eventhandlers to change width
  const handleWidthChange = (value: number) => {
    setWidth(value);
    console.log(width);
  };

  //function to reset the dimensions of the image
  const resetCrop = () => {
    if (currentNode.height && currentNode.width) {
      handleHeightChange(currentNode.height[0]);
      handleWidthChange(currentNode.width[0]);
      console.log(currentNode.width);
    }
  };

  return (
    <div className="resize-container">
      <Button
        style={{ marginRight: 10 }}
        onClick={resetCrop}
        text="Reset Crop"
      />
      <NumberInput
        defaultValue={width}
        value={width}
        step={10}
        precision={1}
        max={currentNode.width && currentNode.width[0]}
        min={10}
        onChange={(valueString: string) => {
          handleWidthChange(Number(valueString));
        }}
      >
        <NumberInputField
          onChange={(valueString) =>
            handleWidthChange(Number(valueString.target.value))
          }
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
      <NumberInput
        defaultValue={height}
        value={height}
        step={10}
        precision={3}
        max={currentNode.height && currentNode.height[0]}
        min={10}
        style={{ marginRight: 10 }}
        onChange={(valueString: string) => {
          handleHeightChange(Number(valueString));
        }}
      >
        <NumberInputField
          onChange={(valueString) => {
            handleHeightChange(Number(valueString.target.value));
          }}
        />
        <NumberInputStepper>
          <NumberIncrementStepper />
          <NumberDecrementStepper />
        </NumberInputStepper>
      </NumberInput>
    </div>
  );
};

export default ImageResizer;
