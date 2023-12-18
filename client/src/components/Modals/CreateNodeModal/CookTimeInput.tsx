import React, { useState, useRef, useEffect } from "react";
import "./CookTimeInput.scss";

export interface CookTimeInputProps {
  onChange: (time: number) => void;
}
export const CookTimeInput = (props: CookTimeInputProps) => {
  const { onChange } = props;
  const [days, setDays] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");

  const daysInputRef = useRef<HTMLInputElement>(null);
  const hoursInputRef = useRef<HTMLInputElement>(null);
  const minutesInputRef = useRef<HTMLInputElement>(null);

  const inputs = [daysInputRef, hoursInputRef, minutesInputRef];

  useEffect(() => {
    console.log(days, hours, minutes);
    const cookTime: number =
      Number(days) * 1440 + Number(hours) * 60 + Number(minutes);
    console.log(cookTime);
    onChange(cookTime);
  }, [days, hours, minutes]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    ref: React.RefObject<HTMLInputElement>
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
    ref: React.RefObject<HTMLInputElement>
  ) => {
    const { key } = e;
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
        ref={daysInputRef}
        type="text"
        maxLength={2}
        value={days}
        onChange={(e) => handleInputChange(e, setDays, daysInputRef)}
        onKeyDown={(e) => handleKeyDown(e, setDays, daysInputRef)}
        placeholder="00"
      />
      <b>d</b>
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
    </div>
  );
};
