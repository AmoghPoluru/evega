"use client";

import { Categories } from "./categories";
import { SearchInput } from "./search-input";
import type { Category } from "@/payload-types";

interface Props {
  data: Category[];
}

export const SearchFilter = ({ data }: Props) => {
  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full" style={{
      backgroundColor: "#F5F5F5",
    }}>
      <SearchInput categories={data} />
      <Categories data={data} />
    </div>
  );
};
