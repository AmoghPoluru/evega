"use client";

import { LoaderIcon } from "lucide-react";
import { trpc } from "@/trpc/client";
import { DEFAULT_LIMIT } from "@/constants";

interface TagsFilterProps {
  value?: string[] | null;
  onChange: (value: string[]) => void;
}

export const TagsFilter = ({ value, onChange }: TagsFilterProps) => {
  const { 
    data, 
    isLoading, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage
  } = trpc.tags.getMany.useInfiniteQuery(
    {
      limit: DEFAULT_LIMIT,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.docs.length > 0 ? lastPage.nextPage : undefined;
      },
    }
  );

  const handleTagToggle = (tag: string) => {
    const currentTags = value || [];
    const newTags = currentTags.includes(tag)
      ? currentTags.filter((t) => t !== tag)
      : [...currentTags, tag];
    onChange(newTags);
  };

  const availableTags = data?.pages.flatMap((page) => 
    page.docs.map((tag: any) => tag.name)
  ) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <LoaderIcon className="size-4 animate-spin" />
      </div>
    );
  }

  if (availableTags.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {availableTags.map((tag) => (
        <label
          key={tag}
          className="flex items-center cursor-pointer group"
        >
          <input
            type="checkbox"
            checked={(value || []).includes(tag)}
            onChange={() => handleTagToggle(tag)}
            className="w-5 h-5 border-2 border-gray-300 rounded cursor-pointer
                     checked:bg-black checked:border-black
                     focus:ring-2 focus:ring-offset-2 focus:ring-black
                     transition-colors"
          />
          <span className="ml-3 text-base font-normal text-gray-900 group-hover:text-black">
            {tag}
          </span>
        </label>
      ))}
      {hasNextPage && (
        <button
          disabled={isFetchingNextPage}
          onClick={() => fetchNextPage()}
          className="text-sm text-gray-600 hover:text-black underline disabled:opacity-50 cursor-pointer"
        >
          Load more...
        </button>
      )}
    </div>
  );
};
