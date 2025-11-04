import React, { useState } from "react";
import Avatar from "react-avatar";
import Select from "react-select";
import type { MultiValue, ActionMeta } from "react-select";

type OptionType = {
  label: string | React.ReactNode;
  value: string;
};

type TagInputProps = {
  suggestions: string[];
  defaultValues?: OptionType[];
  placeholder: string;
  label: string;
  onChange: (values: OptionType[]) => void;
  value: OptionType[];
};

const TagInput: React.FC<TagInputProps> = ({
  suggestions,
  defaultValues = [],
  label,
  onChange,
  value,
}) => {
  const [input, setInput] = useState("");

  const options = suggestions.map((suggestion: string) => ({
    label: (
      <span className="flex items-center gap-2">
        <Avatar name={suggestion} size="25" textSizeRatio={2} round={true} />
        {suggestion}
      </span>
    ),
    value: suggestion,
  }));

  return (
    <div className="flex items-center rounded-md border">
      <span className="ml-3 text-sm text-gray-500">{label}</span>
      <Select<OptionType, true>
        value={value}
        onChange={(newValue: MultiValue<OptionType>) =>
          onChange(Array.from(newValue))
        }
        className="w-full flex-1"
        isMulti
        onInputChange={setInput}
        defaultValue={defaultValues}
        placeholder={""}
        options={
          input
            ? options.concat({
                label: (
                  <span className="flex items-center gap-2">
                    <Avatar
                      name={input}
                      size="25"
                      textSizeRatio={2}
                      round={true}
                    />
                    {input}
                  </span>
                ),
                value: input,
              })
            : options
        }
        classNames={{
          control: () => {
            return "!border-none !outline-none !ring-0 !shadow-none focus:border-none focus:outline-none focus:ring-0 focus:shadow-none dark:bg-transparent";
          },
          multiValue: () => {
            return "dark:!bg-gray-700";
          },
          multiValueLabel: () => {
            return "dark:text-white dark:bg-gray-700 rounded-md";
          },
        }}
        classNamePrefix="select"
      />
    </div>
  );
};

export default TagInput;
