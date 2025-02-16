import { getVariant } from "@hanabi/data";
import { initArray } from "../../../utils";
import * as deckRules from "../../rules/deck";
import { GameMetadata } from "../../types/GameMetadata";
import { State } from "../../types/State";
import { initialGameState } from "./initialGameState";

export function initialState(metadata: GameMetadata): State {
  const game = initialGameState(metadata);

  const { options } = metadata;
  const variant = getVariant(options.variantName);
  const totalCards = deckRules.totalCards(variant);

  return {
    visibleState: null,
    ongoingGame: game,
    replay: {
      active: false,
      segment: 0,
      states: [],
      actions: [],

      databaseID: null,
      shared: null,
      hypothetical: null,
    },

    playing: true,
    shadowing: false,
    finished: false,

    datetimeStarted: null,
    datetimeFinished: null,

    // The array needs to be longer than just the total cards in the deck because we also need to
    // account for notes on a stack base.
    notes: {
      ourNotes: initArray(totalCards + variant.suits.length + 1, {
        possibilities: [],
        chopMoved: false,
        needsFix: false,
        questionMark: false,
        exclamationMark: false,
        knownTrash: false,
        finessed: false,
        blank: false,
        unclued: false,
        clued: false,
        text: "",
      }),
      allNotes: initArray(totalCards + variant.suits.length + 1, []),
      efficiencyModifier: 0,
    },

    metadata,
    cardIdentities: initArray(totalCards, {
      suitIndex: null,
      rank: null,
    }),
    premove: null,
    pause: {
      active: false,
      playerIndex: 0,
      queued: false,
    },
    spectators: [],
    UI: {
      cardDragged: null,
    },
  };
}
