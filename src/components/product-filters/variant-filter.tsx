"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface VariantFilterProps {
  variantType: string;
  variantLabel: string;
  availableOptions: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const VariantFilter = ({ 
  variantType, 
  variantLabel, 
  availableOptions, 
  value, 
  onChange 
}: VariantFilterProps) => {
  const handleOptionToggle = (option: string) => {
    if (value.includes(option)) {
      onChange(value.filter((opt) => opt !== option));
    } else {
      onChange([...value, option]);
    }
  };

  if (availableOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {availableOptions.map((option) => (
        <div key={`${variantType}-${option}`} className="flex items-center gap-2">
          <Checkbox
            id={`${variantType}-${option}`}
            checked={value.includes(option)}
            onCheckedChange={() => handleOptionToggle(option)}
          />
          <Label
            htmlFor={`${variantType}-${option}`}
            className="text-sm font-normal cursor-pointer"
          >
            {option}
          </Label>
        </div>
      ))}
    </div>
  );
};
