"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchIcon } from "lucide-react";

import { useProductFilters } from "@/modules/products/hooks/use-product-filters";

interface Props {
  disabled?: boolean;
  defaultValue?: string | undefined;
  onChange?: (value: string) => void;
}

const SEARCH_SUGGESTIONS = [
  "white shirt",
  "black pant",
  "vintage jacket",
  "denim jeans",
  "summer dress",
  "sneakers",
];

const TYPING_SPEED = 90;
const DELETING_SPEED = 45;
const PAUSE_AFTER_TYPED = 1500;
const PAUSE_AFTER_DELETED = 400;

export const SearchInput = ({
  disabled,
  defaultValue,
  onChange,
}: Props) => {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState(defaultValue || "");
  const [filters, setFilters] = useProductFilters();
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  const showAnimatedPlaceholder = searchValue === "" && !isFocused;

  // Typewriter effect for the animated placeholder
  useEffect(() => {
    if (!showAnimatedPlaceholder) return;

    const currentSuggestion = SEARCH_SUGGESTIONS[suggestionIndex];
    let delay = isDeleting ? DELETING_SPEED : TYPING_SPEED;

    if (!isDeleting && charIndex === currentSuggestion.length) {
      delay = PAUSE_AFTER_TYPED;
    } else if (isDeleting && charIndex === 0) {
      delay = PAUSE_AFTER_DELETED;
    }

    const timer = setTimeout(() => {
      if (!isDeleting && charIndex === currentSuggestion.length) {
        setIsDeleting(true);
        return;
      }

      if (isDeleting && charIndex === 0) {
        setIsDeleting(false);
        setSuggestionIndex((prev) => (prev + 1) % SEARCH_SUGGESTIONS.length);
        return;
      }

      const nextCharIndex = isDeleting ? charIndex - 1 : charIndex + 1;
      setCharIndex(nextCharIndex);
      setDisplayText(currentSuggestion.slice(0, nextCharIndex));
    }, delay);

    return () => clearTimeout(timer);
  }, [showAnimatedPlaceholder, charIndex, isDeleting, suggestionIndex]);

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

    // Navigate to search results page
    const searchUrl = `/search?search=${encodeURIComponent(trimmedValue)}`;
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

  return (
    <form 
      className="flex items-center w-full shadow-xl rounded-xl"
      onSubmit={handleSearch}
    >
      <div className="relative flex-1">
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={showAnimatedPlaceholder ? "" : "Search for products, brands and more..."}
          disabled={disabled}
          className="w-full h-14 px-6 bg-white focus:outline-none text-sm text-gray-700 placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {showAnimatedPlaceholder && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-6 text-sm text-gray-400"
          >
            Search &ldquo;{displayText}&rdquo;
            <span className="ml-0.5 inline-block w-px animate-pulse">|</span>
          </span>
        )}
      </div>

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
