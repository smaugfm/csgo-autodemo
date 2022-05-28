export function searchMatchingClosingBracket(
  str: string,
  indexOfOpeningBracket: number,
): number | null {
  function search(str: string, start: number, level: number): number {
    const brackets = /[{}]/;
    let indexOfNext = str.substring(start).search(brackets);
    if (indexOfNext < 0) {
      return -1;
    }
    indexOfNext = indexOfNext + start;
    if (str[indexOfNext] === '{') {
      return search(str, indexOfNext + 1, level + 1);
    } else {
      if (level === 0) {
        return indexOfNext;
      }
      return search(str, indexOfNext + 1, level - 1);
    }
  }

  const result = search(str, indexOfOpeningBracket + 1, 0);
  return result < 0 ? null : result;
}

export function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

export function strcmp(a: string, b: string) {
  if (a < b) return -1;
  if (a > b) return 1;
  return 0;
}
