import { Input } from "@chakra-ui/react";
import React, { useEffect } from "react";
import { Button } from "~/components/Button";
import * as ri from "react-icons/ri";
import "./StepsInput.scss";

export interface StepsInputProps {
  setSteps: React.Dispatch<React.SetStateAction<string[]>>;
  steps: string[];
}

export const StepsInput = (props: StepsInputProps) => {
  const { setSteps, steps } = props;
  useEffect(() => {
    console.log(steps);
  }, [steps]);
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
  };

  const buttonStyle = { marginTop: "5px", width: "100%", height: "24px" };

  const displaySteps = () => {
    return steps.map((ingredient, index) => {
      return (
        <div className="steps-input-container" key={`ingredient-${index}`}>
          {/* <p
            style={{
              fontSize: "12px",
              marginRight: "10px",
            }}
          >
            {`${index + 1}.`}
          </p> */}
          {index == 0 ? (
            <Input
              className="ingredient-input"
              placeholder="Steps..."
              value={ingredient}
              onChange={(event) => {
                handleInputChange(event, index);
              }}
            />
          ) : (
            <Input
              className="ingredient-input"
              value={ingredient}
              onChange={(event) => {
                handleInputChange(event, index);
              }}
            />
          )}

          {index == steps.length - 1 && (
            <Button
              style={buttonStyle}
              onClick={handleAddInputClick}
              icon={<ri.RiAddFill />}
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
    >
      {displaySteps()}
    </div>
  );
};
