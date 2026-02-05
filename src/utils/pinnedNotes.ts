const STORAGE_KEY = "og-central-pinned-notes";

export interface PinnedNoteRef {
  annotationid: string;
  accountName: string;
}

export function getPinnedNoteRefs(): PinnedNoteRef[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function pinNote(annotationid: string, accountName: string): void {
  const current = getPinnedNoteRefs();
  if (!current.find((n) => n.annotationid === annotationid)) {
    current.push({ annotationid, accountName });
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
