import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Button,
  Textarea,
  Spinner,
  Caption1,
  Tooltip,
  Badge,
} from "@fluentui/react-components";
import {
  Pin16Regular,
  PinOff16Regular,
  Attach16Regular,
  ArrowDownload16Regular,
  Dismiss12Regular,
} from "@fluentui/react-icons";
import { Annotation, NoteEntityType } from "../types";
import {
  getAnnotations,
  createEntityAnnotation,
  deleteAnnotation,
  getAnnotationWithBody,
} from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { pinNote, unpinNote, getPinnedNoteRefs } from "../utils/pinnedNotes";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  notesList: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
    overflowY: "auto",
    flexGrow: 1,
    maxHeight: "300px",
    marginBottom: "12px",
  },
  noteItem: {
    ...shorthands.padding("10px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("6px"),
    border: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  noteHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "6px",
  },
  noteDate: {
    fontSize: "10px",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
  },
  noteActions: {
    display: "flex",
    ...shorthands.gap("2px"),
  },
  attachmentRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    marginTop: "6px",
    color: tokens.colorBrandForeground1,
    fontSize: "12px",
    cursor: "pointer",
    ":hover": {
      textDecoration: "underline",
    },
  },
  inputArea: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
  },
  fileInputRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
  selectedFile: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    ...shorthands.padding("4px", "8px"),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius("4px"),
    fontSize: "12px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  emptyState: {
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
  },
});

interface NotesTimelineProps {
  entityId: string;
  entityName: string;
  entityType: NoteEntityType;
  odataBindKey: string; // e.g. "objectid_account@odata.bind"
  entitySetPath: string; // e.g. "/accounts"
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      // Strip the data:...;base64, prefix
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export const NotesTimeline: React.FC<NotesTimelineProps> = ({
  entityId,
  entityName,
  entityType,
  odataBindKey,
  entitySetPath,
}) => {
  const styles = useStyles();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(
    () => new Set(getPinnedNoteRefs().map((r) => r.annotationid))
  );

  const loadAnnotations = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await getAnnotations(entityId);
      setAnnotations(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    loadAnnotations();
  }, [loadAnnotations]);

  const handleAddNote = async () => {
    if (!newNote.trim() && !selectedFile) return;
    setSubmitting(true);
    try {
      const payload: {
        notetext: string;
        documentbody?: string;
        filename?: string;
        mimetype?: string;
        isdocument?: boolean;
        [key: string]: unknown;
      } = {
        notetext: newNote || "(Attachment)",
        [odataBindKey]: `${entitySetPath}(${entityId})`,
      };
      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        payload.documentbody = base64;
        payload.filename = selectedFile.name;
        payload.mimetype = selectedFile.type || "application/octet-stream";
        payload.isdocument = true;
      }
      await createEntityAnnotation(payload);
      setNewNote("");
      setSelectedFile(null);
      loadAnnotations();
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAnnotation(id);
      // Also unpin if pinned
      if (pinnedIds.has(id)) {
        unpinNote(id);
        setPinnedIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
      loadAnnotations();
    } catch (err) {
      console.error("Failed to delete note:", err);
    }
  };

  const handleDownload = async (annotationId: string) => {
    try {
      const data = await getAnnotationWithBody(annotationId);
      if (data.documentbody && data.filename) {
        const byteChars = atob(data.documentbody);
        const byteArray = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) {
          byteArray[i] = byteChars.charCodeAt(i);
        }
        const blob = new Blob([byteArray], {
          type: data.mimetype || "application/octet-stream",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.filename;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Failed to download attachment:", err);
    }
  };

  const handlePin = (note: Annotation) => {
    if (pinnedIds.has(note.annotationid!)) {
      unpinNote(note.annotationid!);
      setPinnedIds((prev) => {
        const next = new Set(prev);
        next.delete(note.annotationid!);
        return next;
      });
    } else {
      pinNote(note.annotationid!, entityName, entityType);
      setPinnedIds((prev) => new Set(prev).add(note.annotationid!));
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Text weight="semibold">Notes</Text>
        {annotations.length > 0 && (
          <Badge appearance="filled" color="informative" size="small">
            {annotations.length}
          </Badge>
        )}
      </div>

      <div className={styles.notesList}>
        {loading ? (
          <Spinner size="small" />
        ) : annotations.length === 0 ? (
          <Caption1 className={styles.emptyState}>No notes yet</Caption1>
        ) : (
          annotations.map((note) => (
            <div key={note.annotationid} className={styles.noteItem}>
              <div className={styles.noteHeader}>
                <div className={styles.noteDate}>
                  {note.createdon ? formatDate(note.createdon) : ""}
                </div>
                <div className={styles.noteActions}>
                  <Tooltip
                    content={
                      pinnedIds.has(note.annotationid!)
                        ? "Unpin from dashboard"
                        : "Pin to dashboard"
                    }
                    relationship="label"
                  >
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={
                        pinnedIds.has(note.annotationid!) ? (
                          <PinOff16Regular />
                        ) : (
                          <Pin16Regular />
                        )
                      }
                      onClick={() => handlePin(note)}
                      style={{ minWidth: "auto", padding: "2px" }}
                    />
                  </Tooltip>
                  <Tooltip content="Delete note" relationship="label">
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={<Dismiss12Regular />}
                      onClick={() => handleDelete(note.annotationid!)}
                      style={{ minWidth: "auto", padding: "2px" }}
                    />
                  </Tooltip>
                </div>
              </div>
              <Text size={200} style={{ whiteSpace: "pre-wrap" }}>
                {note.notetext}
              </Text>
              {note.isdocument && note.filename && (
                <div
                  className={styles.attachmentRow}
                  onClick={() => handleDownload(note.annotationid!)}
                >
                  <ArrowDownload16Regular />
                  <span>{note.filename}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className={styles.inputArea}>
        <Textarea
          placeholder="Add a note..."
          value={newNote}
          onChange={(_, d) => setNewNote(d.value)}
          rows={2}
          resize="vertical"
        />
        <div className={styles.fileInputRow}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
          <Button
            appearance="subtle"
            size="small"
            icon={<Attach16Regular />}
            onClick={handleFileSelect}
          >
            Attach
          </Button>
          {selectedFile && (
            <div className={styles.selectedFile}>
              <span>{selectedFile.name}</span>
              <Button
                appearance="subtle"
                size="small"
                icon={<Dismiss12Regular />}
                onClick={() => setSelectedFile(null)}
                style={{ minWidth: "auto", padding: "2px" }}
              />
            </div>
          )}
        </div>
        <div className={styles.buttonRow}>
          <Button
            appearance="primary"
            size="small"
            onClick={handleAddNote}
            disabled={(!newNote.trim() && !selectedFile) || submitting}
          >
            {submitting ? "Adding..." : "Add Note"}
          </Button>
        </div>
      </div>
    </div>
  );
};
