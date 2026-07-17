import { useEffect } from "react";

export const HIGH_PRIORITY_OVERLAY_EVENT = "smarty-high-priority-overlay-change";

const activeOverlayCounts = new Map<string, number>();

function activeOverlayTotal() {
  return Array.from(activeOverlayCounts.values()).reduce((sum, count) => sum + count, 0);
}

function publishOverlayState() {
  if (typeof document === "undefined" || typeof window === "undefined") return;

  const active = activeOverlayTotal() > 0;
  document.body.dataset.smartyHighPriorityOverlay = active ? "true" : "false";
  window.dispatchEvent(
    new CustomEvent(HIGH_PRIORITY_OVERLAY_EVENT, {
      detail: {
        active,
        overlays: Array.from(activeOverlayCounts.keys()),
      },
    }),
  );
}

export function hasHighPriorityOverlayOpen() {
  if (typeof document === "undefined") return false;
  return document.body.dataset.smartyHighPriorityOverlay === "true" || activeOverlayTotal() > 0;
}

function setHighPriorityOverlayActive(id: string, active: boolean) {
  if (typeof window === "undefined") return;

  const current = activeOverlayCounts.get(id) || 0;
  if (active) {
    activeOverlayCounts.set(id, current + 1);
  } else if (current <= 1) {
    activeOverlayCounts.delete(id);
  } else {
    activeOverlayCounts.set(id, current - 1);
  }

  publishOverlayState();
}

export function useHighPriorityOverlay(id: string, active: boolean) {
  useEffect(() => {
    if (!active) return;
    setHighPriorityOverlayActive(id, true);
    return () => setHighPriorityOverlayActive(id, false);
  }, [id, active]);
}