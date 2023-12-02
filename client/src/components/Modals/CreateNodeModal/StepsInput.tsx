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

  const displaySteps = () => {
    return steps.map((ingredient, index) => {
      return (
        <div className="steps-input-container" key={`ingredient-${index}`}>
          <p
            style={{
              fontSize: "30px",
              marginRight: "10px",
            }}
          >
            {`${index + 1}.`}
          </p>
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
              style={{ marginLeft: "5px", width: "36px", height: "36px" }}
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
        padding: "0px, 10px, 10px, 10px",
        maxHeight: "160px",
        overflowY: "auto",
        marginRight: "10px",
        width: "500px",
      }}
    >
      <div>{displaySteps()}</div>
    </div>
  );
};
