import { Input } from "@chakra-ui/react";
import React, { useLayoutEffect, useRef, useState } from "react";
import { Button } from "~/components/Button";
import * as ri from "react-icons/ri";
import "./StepsInput.scss";

export interface StepsInputProps {
  setSteps: React.Dispatch<React.SetStateAction<string[]>>;
  steps: string[];
}

export const StepsInput = (props: StepsInputProps) => {
  const { setSteps, steps } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const [buttonPressed, setButtonPressed] = useState(false);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newIngredients = [...steps];
    newIngredients[index] = event.target.value;
    setSteps(newIngredients);
  };

  const handleAddInputClick = () => {
    setSteps([...steps, ""]);
    setButtonPressed(true);
  };

  useLayoutEffect(() => {
    if (buttonPressed && lastInputRef.current && containerRef.current) {
      lastInputRef.current.focus();
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setButtonPressed(false);
    }
  }, [buttonPressed, steps]);

  const addButtonStyle = { marginTop: "5px", width: "100%", height: "24px" };

  const deleteButtonStyle = {
    marginLeft: "5px",
    width: "40px",
    height: "40px",
    backgroundColor: "E95678",
    transition: "background-color 0.3s",
    ":hover": {
      backgroundColor: "#E95678",
    },
  };

  const displaySteps = () => {
    return steps.map((ingredient, index) => {
      const isLast = index === steps.length - 1;
      return (
        <div className="steps-input-container" key={`ingredient-${index}`}>
          {index === 0 ? (
            <Input
              className="step-input"
              placeholder="Steps..."
              value={ingredient}
              onChange={(event) => handleInputChange(event, index)}
              ref={isLast ? lastInputRef : null}
            />
          ) : (
            <div className="input-and-cancel">
              <Input
                className="step-input"
                value={ingredient}
                onChange={(event) => handleInputChange(event, index)}
                ref={isLast ? lastInputRef : null}
              />
              <Button icon={<ri.RiCloseLine />} style={deleteButtonStyle} />
            </div>
          )}

          {isLast && (
            <Button
              style={addButtonStyle}
              onClick={handleAddInputClick}
              icon={<ri.RiAddFill />}
              text="Add Step"
            />
          )}
        </div>
      );
    });
  };

  return (
    <div
      style={{
        maxHeight: "160px",
        overflowY: "auto",
        width: "500px",
      }}
      ref={containerRef}
    >
      {displaySteps()}
    </div>
  );
};
