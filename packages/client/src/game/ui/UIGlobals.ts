import { getDefaultVariant } from "@hanabi/data";
import Konva from "konva";
import type * as Redux from "redux";
import { Globals as LobbyGlobals } from "../../GlobalsA";
import type { Loader } from "../../Loader";
import type { Options } from "../../types/Options";
import type { GameExports } from "../main";
import type { GameMetadata } from "../types/GameMetadata";
import type { State } from "../types/State";
import type { Action, GameAction } from "../types/actions";
import { Elements } from "./Elements";
import type { HanabiCard } from "./HanabiCard";
import { Layers } from "./Layers";
import * as cursor from "./cursor";
import type { StateObserver } from "./reactive/StateObserver";

/**
 * This object contains global variables for the game UI. Every class variable must also be reset in
 * the "reset()" function.
 */
export class UIGlobals {
  // Objects sent upon UI initialization.
  lobby: LobbyGlobals = new LobbyGlobals();
  game: GameExports | null = null;

  // The UI is instantiated before all the images are necessarily downloaded and before we know
  // enough information to draw all the UI elements.
  loading = true;

  // Game constants (set upon first initialization).
  deck: HanabiCard[] = [];
  stackBases: HanabiCard[] = [];

  // UI elements
  imageLoader: Loader | null = null;
  stage: Konva.Stage = new Konva.Stage({
    container: "game",
    listening: false,
  });

  layers: Layers = new Layers();
  elements: Elements = new Elements();
  activeHover: Konva.Node | null = null; // The element that the mouse cursor is currently over

  cardImages = new Map<string, HTMLCanvasElement>();
  scaledCardImages = new Map<string, HTMLCanvasElement[]>();

  // Replay feature
  replayLog: GameAction[] = []; // Contains all of the "action" messages for the game
  finalReplayPos = 0;
  finalReplayTurn = 0;

  // Notes feature. Used to keep track of which card the user is editing; users can only update one
  // note at a time to prevent bugs. Equal to the card order number or null.
  editingNote: number | null = null;
  // Equal to true if something happened when the note box happens to be open.
  actionOccurred = false;
  lastNote = ""; // Equal to the last note entered

  // Timer feature
  timerID: number | null = null;
  playerTimes: number[] = [];
  // "activeIndex" must be tracked separately from the "currentPlayerIndex" because the current
  // player may change in an in-game replay. Legacy variable, kill this and use
  // state.currentPlayerIndex instead.
  activePlayerIndex = -1;
  timeTaken = 0;
  startingTurnTime = 0;
  lastTimerUpdateTimeMS = 0;

  // Miscellaneous
  animateFast = true;
  UIClickTime = 0; // Used to prevent accidental double clicks
  globalEmpathyEnabled = false;

  // State information
  store: Redux.Store<State, Action> | null = null;
  stateObserver: StateObserver | null = null;
  cardSubscriptions: Redux.Unsubscribe[] = [];

  get state(): State {
    return this.store!.getState();
  }

  get metadata(): GameMetadata {
    return this.state.metadata;
  }

  // The variant of the current game is stored in the state metadata as a string. Provide a helper
  // for the variant object that corresponds to this (initialized in the "initStateStore()"
  // function).
  variant = getDefaultVariant();

  get options(): Options {
    return this.state.metadata.options;
  }

  // We provide a method to reset every class variable to its initial value. This is called when the
  // user goes into a new game. We cannot just create a new instantiation of the class, because then
  // the references in the other files would point to the outdated version.
  reset(): void {
    this.lobby = new LobbyGlobals();
    this.game = null;
    this.loading = true;
    this.variant = getDefaultVariant();
    this.deck = [];
    this.stackBases = [];
    this.imageLoader = null;
    this.stage = new Konva.Stage({
      container: "game",
      listening: true,
    });
    this.stage.on("mouseenter mouseleave", () => {
      cursor.set("default");
    });
    this.layers = new Layers();
    this.elements = new Elements();
    this.activeHover = null;
    this.cardImages = new Map<string, HTMLCanvasElement>();
    this.scaledCardImages = new Map<string, HTMLCanvasElement[]>();
    this.replayLog = [];
    this.finalReplayPos = 0;
    this.finalReplayTurn = 0;
    this.editingNote = null;
    this.actionOccurred = false;
    this.lastNote = "";
    this.timerID = null;
    this.playerTimes = [];
    this.activePlayerIndex = -1; // Legacy variable
    this.timeTaken = 0;
    this.startingTurnTime = 0;
    this.lastTimerUpdateTimeMS = 0;
    this.animateFast = true;
    this.UIClickTime = 0;
    this.globalEmpathyEnabled = false;

    this.stateObserver?.unregisterObservers();
    this.stateObserver = null;

    for (const unsubscribeFunc of this.cardSubscriptions) {
      unsubscribeFunc();
    }

    this.cardSubscriptions = [];
    this.store = null;
  }
}

export const globals = new UIGlobals();

// Also make the globals available to the window (so that we can access them from the JavaScript
// console for debugging purposes).
// https://stackoverflow.com/questions/56457935/typescript-error-property-x-does-not-exist-on-type-window
declare global {
  interface Window {
    globals: UIGlobals;
  }
}
// `window` is undefined in Jest tests.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
if (window !== undefined) {
  window.globals = globals;
}