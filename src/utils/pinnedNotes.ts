import { NoteEntityType } from "../types";

const STORAGE_KEY = "og-central-pinned-notes";

export interface PinnedNoteRef {
  annotationid: string;
  entityName: string;
  entityType: NoteEntityType;
}

export function getPinnedNoteRefs(): PinnedNoteRef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored) as unknown[];
    // Migrate old shape: { annotationid, accountName } -> new shape
    return parsed.map((item) => {
      const obj = item as Record<string, unknown>;
      if (obj.entityName !== undefined) return obj as unknown as PinnedNoteRef;
      return {
        annotationid: obj.annotationid as string,
        entityName: (obj.accountName as string) ?? "",
        entityType: "account" as NoteEntityType,
      };
    });
  } catch {
    return [];
  }
}

export function pinNote(annotationid: string, entityName: string, entityType: NoteEntityType): void {
  const current = getPinnedNoteRefs();
  if (!current.find((n) => n.annotationid === annotationid)) {
    current.push({ annotationid, entityName, entityType });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  }
}

export function unpinNote(annotationid: string): void {
  const current = getPinnedNoteRefs().filter(
    (n) => n.annotationid !== annotationid
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
}

export function isNotePinned(annotationid: string): boolean {
  return getPinnedNoteRefs().some((n) => n.annotationid === annotationid);
}
