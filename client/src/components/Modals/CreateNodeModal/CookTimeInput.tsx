import React, { useState, useRef } from "react";
import "./CookTimeInput.scss";

export interface CookTimeInputProps {
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
export const CookTimeInput = (props: CookTimeInputProps) => {
  const { onChange } = props;
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [seconds, setSeconds] = useState("");

  const hoursInputRef = useRef(null);
  const minutesInputRef = useRef(null);
  const secondsInputRef = useRef(null);

  const inputs = [hoursInputRef, minutesInputRef, secondsInputRef];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    ref: React.MutableRefObject<null>
  ) => {
    let value = e.target.value;

    // Allow only numeric characters and limit the length to 2
    value = value.replace(/\D/g, "").slice(0, 2);

    setter(value);

    // If the current input is at its max length, move focus to the next input
    if (value.length === 2) {
      const nextRef = inputs[inputs.indexOf(ref) + 1];
      nextRef?.current?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    ref: React.MutableRefObject<null>
  ) => {
    const { key } = e;
    console.log(ref?.current?.value);
    if (key === "Enter") {
      const nextRef = inputs[inputs.indexOf(ref) + 1];
      nextRef?.current?.focus();
    } else if (
      (key === "Backspace" || key === "Delete") &&
      ref?.current?.value?.length == 0
    ) {
      const prevRef = inputs[inputs.indexOf(ref) - 1];
      prevRef?.current?.focus();
    }
  };

  return (
    <div className="input-container">
      <input
        ref={hoursInputRef}
        type="text"
        maxLength={2}
        value={hours}
        onChange={(e) => handleInputChange(e, setHours, hoursInputRef)}
        onKeyDown={(e) => handleKeyDown(e, setHours, hoursInputRef)}
        placeholder="00"
      />
      <b>hr</b>

      <input
        ref={minutesInputRef}
        type="text"
        maxLength={2}
        value={minutes}
        onChange={(e) => handleInputChange(e, setMinutes, minutesInputRef)}
        onKeyDown={(e) => handleKeyDown(e, setMinutes, minutesInputRef)}
        placeholder="00"
      />
      <b>min</b>

      <input
        ref={secondsInputRef}
        type="text"
        maxLength={2}
        value={seconds}
        onChange={(e) => handleInputChange(e, setSeconds, secondsInputRef)}
        onKeyDown={(e) => handleKeyDown(e, setSeconds, secondsInputRef)}
        placeholder="00"
      />
      <b>s</b>
    </div>
  );
};
