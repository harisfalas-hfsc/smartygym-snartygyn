import { useEffect, useState } from "react";

// LIFO overlay stacking: every time an overlay opens it grabs the next
// z-index in the sequence, so the most recently opened overlay is always on
// top and can be closed first. No priority, no blocking between overlays.

const BASE_Z = 50;
let counter = 0;

function nextZ() {
  counter += 1;
  return BASE_Z + counter;
}

/**
 * Returns a stable z-index for the current open lifecycle of an overlay.
 * The z-index is assigned when `active` flips to true and stays until it
 * flips to false, so later-opened overlays sit above earlier ones (LIFO).
 */
export function useOverlayZIndex(active: boolean): number {
  const [z, setZ] = useState<number>(BASE_Z);
  useEffect(() => {
    if (active) setZ(nextZ());
  }, [active]);
  return z;
}

// Back-compat no-op exports (previous priority system). Kept so lingering
// imports don't break; they no longer block or reorder anything.
export const HIGH_PRIORITY_OVERLAY_EVENT = "smarty-high-priority-overlay-change";
export function hasHighPriorityOverlayOpen() { return false; }
export function useHighPriorityOverlay(_id: string, _active: boolean) { /* no-op */ }