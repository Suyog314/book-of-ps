import { Input } from "@chakra-ui/input";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "~/components/Button";
import * as ri from "react-icons/ri";
import "./IngredientInput.scss";

export interface IngredientsInputProps {
  setIngredients: React.Dispatch<React.SetStateAction<string[]>>;
  ingredients: string[];
}

export const IngredientsInput = (props: IngredientsInputProps) => {
  const { ingredients, setIngredients } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const lastInputRef = useRef<HTMLInputElement>(null);
  const [buttonPressed, setButtonPressed] = useState(false);

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
    setButtonPressed(true);
  };

  useLayoutEffect(() => {
    if (buttonPressed && lastInputRef.current && containerRef.current) {
      lastInputRef.current.focus();
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
      setButtonPressed(false);
    }
  }, [buttonPressed, ingredients]);

  const buttonStyle = { marginTop: "5px", width: "100%", height: "24px" };

  const displayIngredients = () => {
    return ingredients.map((ingredient, index) => {
      const isLast = index === ingredients.length - 1;
      return (
        <div className="ingredient-input-container" key={`ingredient-${index}`}>
          {index === 0 ? (
            <Input
              className="ingredient-input"
              placeholder="Ingredients..."
              value={ingredient}
              onChange={(event) => handleInputChange(event, index)}
              ref={isLast ? lastInputRef : null}
            />
          ) : (
            <Input
              className="ingredient-input"
              value={ingredient}
              onChange={(event) => handleInputChange(event, index)}
              ref={isLast ? lastInputRef : null}
            />
          )}

          {isLast && (
            <Button
              style={buttonStyle}
              onClick={handleAddInputClick}
              icon={<ri.RiAddFill />}
              text="Add Ingredient"
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
      <div>{displayIngredients()}</div>
    </div>
  );
};
