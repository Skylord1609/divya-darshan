

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
};


// --- Fuzzy Search Utilities ---

/**
 * Calculates the Levenshtein distance between two strings.
 * A measure of the difference between two sequences (number of edits to change one into the other).
 * @param s1 The first string.
 * @param s2 The second string.
 * @returns The Levenshtein distance.
 */
export const calculateLevenshteinDistance = (s1: string = '', s2: string = ''): number => {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0)
                costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue),
                            costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0)
            costs[s2.length] = lastValue;
    }
    return costs[s2.length];
};

/**
 * Performs a fuzzy search on an array of objects.
 * @param items The array of items to search.
 * @param query The search query.
 * @param keys The keys within each item to search against.
 * @param maxDistance The maximum Levenshtein distance to be considered a match.
 * @returns A sorted array of items that match the query, including their match score.
 */
export const fuzzySearch = <T extends object>(
  items: T[],
  query: string,
  keys: (keyof T)[],
  maxDistance = 2
): { item: T; score: number }[] => {
  if (!query) {
    return items.map(item => ({ item, score: 0 }));
  }
  const lowerCaseQuery = query.toLowerCase();

  const results: { item: T; score: number }[] = [];

  items.forEach(item => {
    let bestScore = Infinity;

    for (const key of keys) {
      const value = item[key];
      if (typeof value === 'string') {
        const lowerCaseValue = value.toLowerCase();
        
        // Prioritize exact substring matches
        if (lowerCaseValue.includes(lowerCaseQuery)) {
            bestScore = 0;
            break; 
        }

        // Check Levenshtein distance against parts of the string for better partial matches
        const words = lowerCaseValue.split(' ');
        for (const word of words) {
            const distance = calculateLevenshteinDistance(lowerCaseQuery, word);
            if (distance < bestScore) {
                bestScore = distance;
            }
        }
      }
    }

    if (bestScore <= maxDistance) {
      results.push({ item, score: bestScore });
    }
  });

  return results.sort((a, b) => a.score - b.score);
};