const STORAGE_KEY = "og-central-parking-lot";

export type ParkedEntityType =
  | "actionitem"
  | "idea"
  | "account"
  | "contact"
  | "project"
  | "impact"
  | "summary";

export interface ParkedItemRef {
  id: string;
  name: string;
  entityType: ParkedEntityType;
  route: string;
}

export function getParkedItems(): ParkedItemRef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    return JSON.parse(stored) as ParkedItemRef[];
  } catch {
    return [];
  }
}

export function parkItem(ref: ParkedItemRef): void {
  const current = getParkedItems();
  if (!current.find((item) => item.id === ref.id && item.entityType === ref.entityType)) {
    current.push(ref);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
}

export function unparkItem(id: string): void {
  const current = getParkedItems().filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function isItemParked(id: string): boolean {
  return getParkedItems().some((item) => item.id === id);
}
