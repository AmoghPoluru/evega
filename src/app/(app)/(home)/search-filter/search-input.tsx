"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon, ChevronDown } from "lucide-react";

import { useProductFilters } from "@/modules/products/hooks/use-product-filters";
import type { Category } from "@/payload-types";

interface Props {
  disabled?: boolean;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
  categories?: Category[];
}

export const SearchInput = ({
  disabled,
  defaultValue,
  onChange,
  categories = [],
}: Props) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(defaultValue || "");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filters, setFilters] = useProductFilters();

  // Sync local state with URL params
  useEffect(() => {
    if (filters.search !== searchValue) {
      setSearchValue(filters.search || "");
    }
  }, [filters.search]);

  // Function to trigger search - only called on button click or Enter key
  const handleSearch = (e?: { preventDefault: () => void }) => {
    e?.preventDefault();
    const trimmedValue = searchValue.trim();
    
    if (!trimmedValue) {
      // If no search term, clear search and stay on current page
      setFilters({ 
        ...filters,
        search: "" 
      });
      onChange?.("");
      return;
    }

    // Build search URL with optional category filter
    let searchUrl = `/search?search=${encodeURIComponent(trimmedValue)}`;
    
    // If a category is selected (not "All"), add it to the URL
    if (selectedCategory !== "All") {
      const categoryObj = categories.find(cat => cat.name === selectedCategory);
      if (categoryObj) {
        searchUrl += `&category=${encodeURIComponent(categoryObj.slug)}`;
      }
    }

    // Navigate to search results page
    router.push(searchUrl);
    onChange?.(trimmedValue);
  };

  // Handle Enter key press
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // Prepare category options - "All" first, then all categories
  const categoryOptions = [
    "All",
    ...categories.map((cat) => cat.name)
  ];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setIsDropdownOpen(false);
    // Category selection is handled separately via navigation
    // For now, we just update the local state
  };

  return (
    <form 
      className="flex items-center w-full shadow-xl rounded-xl"
      onSubmit={handleSearch}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled}
          className="h-14 px-5 bg-gradient-to-b from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 border-r border-gray-200 flex items-center gap-2 transition-all duration-200 shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="text-sm font-medium text-gray-700">{selectedCategory}</span>
          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {isDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-10" 
              onClick={() => setIsDropdownOpen(false)} 
            />
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-gray-100">
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => handleCategorySelect(category)}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-orange-50 transition-colors ${
                    selectedCategory === category 
                      ? 'bg-orange-50 font-semibold text-orange-600' 
                      : 'text-gray-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <input
        type="text"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for products, brands and more..."
        disabled={disabled}
        className="flex-1 h-14 px-6 bg-white focus:outline-none text-sm text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      <button
        type="submit"
        disabled={disabled}
        className="h-14 px-8 bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-400 hover:from-orange-600 hover:via-orange-500 hover:to-yellow-500 rounded-r-xl flex items-center justify-center transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed min-w-[60px] relative z-10"
        aria-label="Search"
        style={{ backgroundColor: '#f97316' }}
      >
        <SearchIcon className="w-6 h-6 text-white" strokeWidth={3} />
      </button>
    </form>
  );
};
