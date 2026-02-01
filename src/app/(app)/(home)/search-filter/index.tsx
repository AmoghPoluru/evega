"use client";

import { Categories } from "./categories";
import { SearchInput } from "./search-input";

interface Props {
  data: any;
}

export const SearchFilter = ({ data }: Props) => {
  return (
    <div className="px-4 lg:px-12 py-8 border-b flex flex-col gap-4 w-full" style={{
      backgroundColor: "#F5F5F5",
    }}>
      <SearchInput disabled />
     <Categories data={data} />
    
    </div>
  );
};
