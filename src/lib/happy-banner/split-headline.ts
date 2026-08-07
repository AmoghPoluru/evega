/** Split a headline like "HUE ARE YOU?" into two editorial lines. */
export function splitEditorialHeadline(word1: string): { line1: string; line2: string } {
  const text = word1.trim().toUpperCase();
  if (!text) {
    return { line1: "", line2: "" };
  }

  const youSplit = text.match(/^(.+?)\s+(YOU\??)$/);
  if (youSplit) {
    return { line1: youSplit[1].trim(), line2: youSplit[2].trim() };
  }

  const words = text.split(/\s+/);
  if (words.length >= 2) {
    const mid = Math.ceil(words.length / 2);
    return {
      line1: words.slice(0, mid).join(" "),
      line2: words.slice(mid).join(" "),
    };
  }

  return { line1: text, line2: "" };
}
