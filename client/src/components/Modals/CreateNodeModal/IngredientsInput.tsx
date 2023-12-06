import { Input } from "@chakra-ui/input";
import React, { useEffect, useState } from "react";
import { Button } from "~/components/Button";
import * as ri from "react-icons/ri";
import "./IngredientInput.scss";

export interface IngredientsInputProps {
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  ingredients: string[];
}
export const IngredientsInput = (props: IngredientsInputProps) => {
  const { ingredients, setIngredients } = props;

  useEffect(() => {
    console.log(ingredients);
  }, [ingredients]);

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = event.target.value;
    setIngredients(newIngredients);
  };

  const handleAddInputClick = () => {
    setIngredients([...ingredients, ""]);
  };

  const displayIngredients = () => {
    return ingredients.map((ingredient, index) => {
      return (
        <div className="ingredient-input-container" key={`ingredient-${index}`}>
          <p
            style={{
              fontSize: "30px",
              marginRight: "10px",
            }}
          >
            •
          </p>
          {index == 0 ? (
            <Input
              className="ingredient-input"
              placeholder="Ingredients..."
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

          {index == ingredients.length - 1 && (
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
      <div>{displayIngredients()}</div>
    </div>
  );
};
