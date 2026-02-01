"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface TagsFilterProps {
  availableTags: string[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const TagsFilter = ({ availableTags, value, onChange }: TagsFilterProps) => {
  const handleTagToggle = (tag: string) => {
    if (value.includes(tag)) {
      onChange(value.filter((t) => t !== tag));
    } else {
      onChange([...value, tag]);
    }
  };

  if (availableTags.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-2">
        No tags available
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {availableTags.map((tag) => (
        <div key={tag} className="flex items-center gap-2">
          <Checkbox
            id={tag}
            checked={value.includes(tag)}
            onCheckedChange={() => handleTagToggle(tag)}
          />
          <Label
            htmlFor={tag}
            className="text-sm font-normal cursor-pointer"
          >
            {tag}
          </Label>
        </div>
      ))}
    </div>
  );
};
