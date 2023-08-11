import { getDefaultVariant, getVariant } from "@hanabi/data";
import { getPossibilitiesFromKeywords } from "./noteIdentity";

const DEFAULT_VARIANT = getDefaultVariant();
const UP_OR_DOWN_VARIANT = getVariant("Up or Down (5 Suits)");

const ZEROES = [0, 0, 0, 0, 0, 0] as const;
const ONES = [1, 1, 1, 1, 1, 1] as const;

describe("noteIdentity", () => {
  describe("getPossibilitiesFromKeyword", () => {
    // The note keyword `red` should return `[[0,1], [0,2], [0,3], [0,4], [0,5]]`.
    test("positive suit full", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, ["red"]);
      expect(possibles).toEqual([
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
      ]);
    });

    test("positive suit short", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, ["r"]);
      expect(possibles).toEqual([
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
      ]);
    });

    test("positive suit with Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "red",
      ]);
      expect(possibles).toEqual([
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
        [0, 5],
        [0, 7],
      ]);
    });

    // The note keyword `red 3, blue 3` should return `[[0,3], [3,3]]`.
    test("positive conjunct full", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "red 3, blue 3",
      ]);
      expect(possibles).toEqual([
        [0, 3],
        [3, 3],
      ]);
    });

    test("positive conjunct short", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "r3,b3",
      ]);
      expect(possibles).toEqual([
        [0, 3],
        [3, 3],
      ]);
    });

    test("positive conjunct with Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "red 3, blue 3",
      ]);
      expect(possibles).toEqual([
        [0, 3],
        [3, 3],
      ]);
    });

    // It is not possible to represent "r3,bs" as "red 3, blue start". Thus, we only test the short
    // version.
    test("positive conjunct with START card short", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "r3,bs",
      ]);
      expect(possibles).toEqual([
        [0, 3],
        [3, 7],
      ]);
    });

    test("negative conjunct", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "!2, !3",
      ]);
      const identMap = rankMap(new Set([1, 4, 5]));
      expect(identityArrayToMap(possibles)).toEqual(identMap);
    });

    test("negative conjunct with Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "!2, !3",
      ]);
      const identMap = rankMap(new Set([1, 4, 5, 7]));
      expect(identityArrayToMap(possibles)).toEqual(identMap);
    });

    test("negative conjunct with space", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "! 2, ! 3",
      ]);
      const identMap = rankMap(new Set([1, 4, 5]));
      expect(identityArrayToMap(possibles)).toEqual(identMap);
    });

    // The note keyword `r,b,2,3` would return all red, blue, 2's OR 3's.
    test("positive suit and rank", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "r,3,b,2",
      ]);
      expect(possibles).toEqual([
        [0, 1],
        [3, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [0, 4],
        [3, 4],
        [0, 5],
        [3, 5],
      ]);
    });

    test("positive suit and rank with Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "r,3,b,2",
      ]);
      expect(possibles).toEqual([
        [0, 1],
        [3, 1],
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
        [4, 2],
        [0, 3],
        [1, 3],
        [2, 3],
        [3, 3],
        [4, 3],
        [0, 4],
        [3, 4],
        [0, 5],
        [3, 5],
        [0, 7],
        [3, 7],
      ]);
    });

    // The note keyword `r3b2` would return all red cards, 3's, blue cards, or 2's. (A player would
    // probably conventionally write this as `rb23`, but we test for the more complicated case.)
    test("positive squish", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, ["r3b2"]);
      expect(possibles).toEqual([
        [0, 2],
        [3, 2],
        [0, 3],
        [3, 3],
      ]);
    });

    test("positive squish in Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "r3b2",
      ]);
      expect(possibles).toEqual([
        [0, 2],
        [3, 2],
        [0, 3],
        [3, 3],
      ]);
    });

    // The note keyword `r,!2,!3` would return `[[0,1], [0,4], [0,5]`.
    test("positive and negative", () => {
      const possibles = getPossibilitiesFromKeywords(DEFAULT_VARIANT, [
        "r,!2,!3",
      ]);
      expect(possibles).toEqual([
        [0, 1],
        [0, 4],
        [0, 5],
      ]);
    });

    test("positive and negative in Up or Down", () => {
      const possibles = getPossibilitiesFromKeywords(UP_OR_DOWN_VARIANT, [
        "r,!2,!3",
      ]);
      expect(possibles).toEqual([
        [0, 1],
        [0, 4],
        [0, 5],
        [0, 7],
      ]);
    });
  });
});

function rankMap(
  ranks: Set<number>,
  suitLength: number = UP_OR_DOWN_VARIANT.suits.length,
): number[][] {
  const cardMap: number[][] = [];

  for (const rank of [1, 2, 3, 4, 5, 6, 7]) {
    if (ranks.has(rank)) {
      cardMap.push(ONES.slice(0, suitLength));
    } else {
      cardMap.push(ZEROES.slice(0, suitLength));
    }
  }

  return cardMap;
}

function identityArrayToMap(
  possibles: Array<[number, number]>,
  suitLength: number = UP_OR_DOWN_VARIANT.suits.length,
): number[][] {
  const cardMap: number[][] = [];

  for (let rank = 1; rank <= 7; rank++) {
    cardMap.push(ZEROES.slice(0, suitLength));
  }

  for (const ident of possibles) {
    cardMap[ident[1] - 1]![ident[0]] = 1;
  }

  return cardMap;
}
