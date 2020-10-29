import Konva from "konva";
import Screen from "../../lobby/types/Screen";
import { TOOLTIP_DELAY } from "./constants";
import NodeWithTooltip from "./controls/NodeWithTooltip";
import TextWithTooltip from "./controls/TextWithTooltip";
import globals from "./globals";

export const init = (
  element: NodeWithTooltip,
  delayed: boolean,
  customContent: boolean,
): void => {
  if (element.tooltipName === undefined) {
    throw new Error(
      'An element that is supposed to have a tooltip does not have a "tooltipName" property.',
    );
  }
  if (element.tooltipContent === undefined) {
    throw new Error(
      'An element that is supposed to have a tooltip does not have a "tooltipContent" property.',
    );
  }

  element.on("mouseover touchstart", function mouseOver(this: Konva.Node) {
    resetActiveHover();
    globals.activeHover = this;
    if (!delayed) {
      show(this);
    } else {
      setTimeout(() => {
        show(this);
      }, TOOLTIP_DELAY);
    }
  });
  element.on("mouseout touchend", () => {
    if (element.tooltipName === undefined) {
      throw new Error(
        'An element that is supposed to have a tooltip does not have a "tooltipName" property.',
      );
    }
    globals.activeHover = null;
    $(`#tooltip-${element.tooltipName}`).tooltipster("close");
  });
  let content = element.tooltipContent;
  if (!customContent) {
    content = '<span style="font-size: 0.75em;">';
    content += '<i class="fas fa-info-circle fa-sm"></i>';
    content += ` &nbsp;${element.tooltipContent}</span>`;
  }
  $(`#tooltip-${element.tooltipName}`).tooltipster("instance").content(content);
};

export const show = (element: NodeWithTooltip): void => {
  // Don't do anything if we are no longer in the game
  if (globals.lobby.currentScreen !== Screen.Game) {
    return;
  }

  // Don't do anything if the user has moved the mouse away in the meantime
  if (globals.activeHover !== element) {
    return;
  }

  if (element.tooltipName === undefined) {
    throw new Error(
      'An element that is supposed to have a tooltip does not have a "tooltipName" property.',
    );
  }
  const tooltip = $(`#tooltip-${element.tooltipName}`);
  const pos = element.getAbsolutePosition();
  let width = element.width();
  if (element instanceof Konva.Text) {
    width = element.getTextWidth();

    // For text elements consisting of only one emoji,
    // "getTextWidth()" will not return the correct width
    // Fall back to the element width instead
    const text = element as TextWithTooltip;
    if (text.emoji) {
      width = element.width();
    }
  }
  const tooltipX = pos.x + width / 2;
  tooltip.css("left", tooltipX);
  tooltip.css("top", pos.y);
  tooltip.tooltipster("open");
};

export const resetActiveHover = (): void => {
  if (globals.activeHover !== null) {
    globals.activeHover.dispatchEvent(new MouseEvent("mouseout"));
  }
};
