export function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(n, max));
}

/**
 * Helper function to return an array of integers with the specified range, inclusive on the lower
 * end and exclusive on the high end. (The "e" stands for exclusive.)
 *
 * - For example, `eRange(1, 3)` will return `[1, 2]`.
 * - For example, `eRange(2)` will return `[0, 1]`.
 *
 * @param start The integer to start at.
 * @param end Optional. The integer to end at. If not specified, then the start will be 0 and the
 *            first argument will be the end.
 * @param increment Optional. The increment to use. Default is 1.
 */
export function eRange(start: number, end?: number, increment = 1): number[] {
  if (end === undefined) {
    return eRange(0, start);
  }

  const array: number[] = [];
  for (let i = start; i < end; i += increment) {
    array.push(i);
  }

  return array;
}

/**
 * Helper function to return an array of integers with the specified range, inclusive on both ends.
 * (The "i" stands for inclusive.)
 *
 * - For example, `iRange(1, 3)` will return `[1, 2, 3]`.
 * - For example, `iRange(2)` will return `[0, 1, 2]`.
 *
 * @param start The integer to start at.
 * @param end Optional. The integer to end at. If not specified, then the start will be 0 and the
 *            first argument will be the end.
 * @param increment Optional. The increment to use. Default is 1.
 */
export function iRange(start: number, end?: number, increment = 1): number[] {
  if (end === undefined) {
    return iRange(0, start);
  }

  const exclusiveEnd = end + 1;
  return eRange(start, exclusiveEnd, increment);
}

/** From: https://stackoverflow.com/questions/61526746 */
export function isKeyOf<T extends object>(
  key: PropertyKey,
  target: T,
): key is keyof T {
  return key in target;
}

/**
 * This is a more reliable version of `parseInt`. By default, `parseInt('1a')` will return "1",
 * which is unexpected. This returns either an integer or NaN.
 */
export function parseIntSafe(input: string): number {
  if (typeof input !== "string") {
    return Number.NaN;
  }

  // Remove all leading and trailing whitespace.
  let trimmedInput = input.trim();

  const isNegativeNumber = trimmedInput.startsWith("-");
  if (isNegativeNumber) {
    // Remove the leading minus sign before we match the regular expression.
    trimmedInput = trimmedInput.slice(1);
  }

  if (/^\d+$/.exec(trimmedInput) === null) {
    // "\d" matches any digit (same as "[0-9]").
    return Number.NaN;
  }

  if (isNegativeNumber) {
    // Add the leading minus sign back.
    trimmedInput = `-${trimmedInput}`;
  }

  return Number.parseInt(trimmedInput, 10);
}

/** Initializes an array with all elements containing the specified default value. */
export function newArray<T>(length: number, value: T): T[] {
  return Array.from({ length }, () => value);
}

/** Helper function to trim a suffix from a string, if it exists. Returns the trimmed string. */
export function trimSuffix(string: string, prefix: string): string {
  if (!string.endsWith(prefix)) {
    return string;
  }

  const endCharacter = string.length - prefix.length;
  return string.slice(0, endCharacter);
}
