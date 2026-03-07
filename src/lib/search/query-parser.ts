/**
 * Query Parser
 * Intelligently parses search queries to extract variant information and keywords
 */

import { mapToVariantType, isSizeTerm, isColorTerm, isMaterialTerm } from "./variant-mapper";

export interface ParsedQuery {
  size?: string;
  color?: string;
  material?: string;
  minPrice?: string;
  maxPrice?: string;
  keywords: string[];
  rawTerms: string[];
}

/**
 * Parse a search query to extract variant information and keywords
 * 
 * Example: "red dress size small" → { color: "red", size: "small", keywords: ["dress"] }
 */
export function parseQuery(query: string): ParsedQuery {
  const trimmed = query.trim();
  if (!trimmed) {
    return { keywords: [], rawTerms: [] };
  }

  // Split query into terms
  const terms = trimmed.toLowerCase().split(/\s+/).filter(term => term.length > 0);
  const rawTerms = [...terms];

  const result: ParsedQuery = {
    keywords: [],
    rawTerms,
  };

  // Track which terms have been matched to variants or price
  const matchedIndices = new Set<number>();

  // First pass: Look for price patterns (before variant matching to avoid conflicts)
  for (let i = 0; i < terms.length; i++) {
    const term = terms[i];
    const nextTerm = terms[i + 1];
    const prevTerm = terms[i - 1];

    // Check for price patterns: "under 500", "less than 500", "below 500", "< 500"
    if ((term === "under" || term === "below" || term === "less") && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.maxPrice = priceValue;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }

    // Check for "than X" pattern (after "less")
    if (term === "than" && prevTerm === "less" && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.maxPrice = priceValue;
        matchedIndices.add(i - 1); // Mark "less"
        matchedIndices.add(i);     // Mark "than"
        matchedIndices.add(i + 1);  // Mark price
        i++; // Skip next term
        continue;
      }
    }

    // Check for "over X", "above X", "more than X", "> X"
    if ((term === "over" || term === "above" || term === "more") && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.minPrice = priceValue;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }

    // Check for "than X" pattern (after "more")
    if (term === "than" && prevTerm === "more" && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.minPrice = priceValue;
        matchedIndices.add(i - 1); // Mark "more"
        matchedIndices.add(i);     // Mark "than"
        matchedIndices.add(i + 1);  // Mark price
        i++; // Skip next term
        continue;
      }
    }

    // Check for "< X" or "> X" patterns (if term is just "<" or ">")
    if ((term === "<" || term === "&lt;") && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.maxPrice = priceValue;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }

    if ((term === ">" || term === "&gt;") && nextTerm) {
      const priceValue = extractPriceValue(nextTerm);
      if (priceValue) {
        result.minPrice = priceValue;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }
  }

  // Second pass: Look for explicit variant indicators like "size", "color", "material"
  for (let i = 0; i < terms.length; i++) {
    if (matchedIndices.has(i)) {
      continue; // Already matched
    }

    const term = terms[i];
    const nextTerm = terms[i + 1];

    // Check for "size X" pattern
    if (term === "size" && nextTerm) {
      const variantMatch = mapToVariantType(nextTerm);
      if (variantMatch && variantMatch.type === "size") {
        result.size = variantMatch.value;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }

    // Check for "color X" pattern
    if (term === "color" && nextTerm) {
      const variantMatch = mapToVariantType(nextTerm);
      if (variantMatch && variantMatch.type === "color") {
        result.color = variantMatch.value;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }

    // Check for "material X" pattern
    if (term === "material" && nextTerm) {
      const variantMatch = mapToVariantType(nextTerm);
      if (variantMatch && variantMatch.type === "material") {
        result.material = variantMatch.value;
        matchedIndices.add(i);
        matchedIndices.add(i + 1);
        i++; // Skip next term
        continue;
      }
    }
  }

  // Second pass: Direct variant matching (without explicit type indicators)
  for (let i = 0; i < terms.length; i++) {
    if (matchedIndices.has(i)) {
      continue; // Already matched
    }

    const term = terms[i];
    const variantMatch = mapToVariantType(term);

    if (variantMatch) {
      // Only assign if not already set (first match wins)
      if (variantMatch.type === "size" && !result.size) {
        result.size = variantMatch.value;
        matchedIndices.add(i);
      } else if (variantMatch.type === "color" && !result.color) {
        result.color = variantMatch.value;
        matchedIndices.add(i);
      } else if (variantMatch.type === "material" && !result.material) {
        result.material = variantMatch.value;
        matchedIndices.add(i);
      }
    }
  }

  // Third pass: Collect remaining terms as keywords
  for (let i = 0; i < terms.length; i++) {
    if (!matchedIndices.has(i)) {
      const term = terms[i];
      // Skip common stop words
      if (!isStopWord(term)) {
        result.keywords.push(term);
      }
    }
  }

  return result;
}

/**
 * Extract price value from a term (handles "500", "500$", "$500", "500rs", etc.)
 */
function extractPriceValue(term: string): string | null {
  // Remove currency symbols and common suffixes
  const cleaned = term
    .replace(/[$₹€£¥,]/g, '') // Remove currency symbols and commas
    .replace(/rs|rupees|dollars?|euros?|pounds?/i, '') // Remove currency words
    .trim();

  // Check if it's a valid number
  const numValue = parseFloat(cleaned);
  if (!isNaN(numValue) && numValue > 0) {
    return numValue.toString();
  }

  return null;
}

/**
 * Check if a word is a stop word (common words to ignore)
 */
function isStopWord(word: string): boolean {
  const stopWords = new Set([
    "a", "an", "and", "are", "as", "at", "be", "by", "for", "from",
    "has", "he", "in", "is", "it", "its", "of", "on", "that", "the",
    "to", "was", "will", "with", "the", "this", "but", "they", "have",
    "had", "what", "said", "each", "which", "their", "time", "if",
    "up", "out", "many", "then", "them", "these", "so", "some", "her",
    "would", "make", "like", "into", "him", "has", "two", "more",
    "very", "after", "words", "long", "than", "first", "been", "call",
    "who", "oil", "sit", "now", "find", "down", "day", "did", "get",
    "come", "made", "may", "part", "over", "new", "sound", "take",
    "only", "little", "work", "know", "place", "year", "live", "me",
    "back", "give", "most", "very", "after", "thing", "our", "just",
    "name", "good", "sentence", "man", "think", "say", "great", "where",
    "help", "through", "much", "before", "line", "right", "too", "mean",
    "old", "any", "same", "tell", "boy", "follow", "came", "want",
    "show", "also", "around", "form", "three", "small", "set", "put",
    "end", "does", "another", "well", "large", "must", "big", "even",
    "such", "because", "turn", "here", "why", "ask", "went", "men",
    "read", "need", "land", "different", "home", "us", "move", "try",
    "kind", "hand", "picture", "again", "change", "off", "play", "spell",
    "air", "away", "animal", "house", "point", "page", "letter", "mother",
    "answer", "found", "study", "still", "learn", "should", "America",
    "world", "high", "every", "near", "add", "food", "between", "own",
    "below", "country", "plant", "last", "school", "father", "keep",
    "tree", "never", "start", "city", "earth", "eye", "light", "thought",
    "head", "under", "story", "saw", "left", "don't", "few", "while",
    "along", "might", "close", "something", "seem", "next", "hard", "open",
    "example", "begin", "life", "always", "those", "both", "paper",
    "together", "got", "group", "often", "run", "important", "until",
    "children", "side", "feet", "car", "mile", "night", "walk", "white",
    "sea", "began", "grow", "took", "river", "four", "carry", "state",
    "once", "book", "hear", "stop", "without", "second", "later", "miss",
    "idea", "enough", "eat", "face", "watch", "far", "Indian", "really",
    "almost", "let", "above", "girl", "sometimes", "mountain", "cut",
    "young", "talk", "soon", "list", "song", "leave", "family", "it's"
  ]);

  return stopWords.has(word.toLowerCase());
}

/**
 * Reconstruct query from parsed result (for debugging)
 */
export function reconstructQuery(parsed: ParsedQuery): string {
  const parts: string[] = [];

  if (parsed.color) {
    parts.push(parsed.color);
  }
  if (parsed.size) {
    parts.push(parsed.size);
  }
  if (parsed.material) {
    parts.push(parsed.material);
  }
  parts.push(...parsed.keywords);

  return parts.join(" ");
}
