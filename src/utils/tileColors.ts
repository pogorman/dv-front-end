import { TaskPriority } from "../types";

const STORAGE_KEY = "og-tile-colors";

export type TileColor = "blue" | "orange" | "red" | "darkred";

export const TILE_COLOR_VALUES: Record<TileColor, string> = {
  blue: "rgba(74, 158, 255, 0.12)",
  orange: "rgba(245, 158, 11, 0.12)",
  red: "rgba(248, 113, 113, 0.12)",
  darkred: "rgba(185, 28, 28, 0.18)",
};

export const TILE_COLOR_DOTS: Record<TileColor, string> = {
  blue: "#4a9eff",
  orange: "#f59e0b",
  red: "#f87171",
  darkred: "#b91c1c",
};

// --- Priority ↔ Color mapping ---

const COLOR_TO_PRIORITY: Record<TileColor, TaskPriority> = {
  blue: 468510000,    // Low
  orange: 468510001,  // Eh
  red: 468510003,     // High
  darkred: 468510002, // Top Priority
};

const PRIORITY_TO_COLOR: Record<number, TileColor> = {
  468510000: "blue",
  468510001: "orange",
  468510003: "red",
  468510002: "darkred",
};

export function colorToPriority(color: TileColor | null): TaskPriority | null {
  return color ? COLOR_TO_PRIORITY[color] : null;
}

export function priorityToColor(priority?: TaskPriority | null): TileColor | null {
  if (priority == null) return null;
  return PRIORITY_TO_COLOR[priority] ?? null;
}

export function priorityToBackground(priority?: TaskPriority | null): string | undefined {
  const color = priorityToColor(priority);
  return color ? TILE_COLOR_VALUES[color] : undefined;
}

// --- localStorage-based colors (for entities without priority field) ---

function loadColors(): Record<string, TileColor> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveColors(colors: Record<string, TileColor>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(colors));
}

function makeKey(entityType: string, entityId: string): string {
  return `${entityType}:${entityId}`;
}

export function getTileColor(entityType: string, entityId: string): TileColor | null {
  const colors = loadColors();
  return colors[makeKey(entityType, entityId)] ?? null;
}

export function setTileColor(entityType: string, entityId: string, color: TileColor): void {
  const colors = loadColors();
  colors[makeKey(entityType, entityId)] = color;
  saveColors(colors);
}

export function clearTileColor(entityType: string, entityId: string): void {
  const colors = loadColors();
  delete colors[makeKey(entityType, entityId)];
  saveColors(colors);
}

export function getTileBackground(entityType: string, entityId: string): string | undefined {
  const color = getTileColor(entityType, entityId);
  return color ? TILE_COLOR_VALUES[color] : undefined;
}
