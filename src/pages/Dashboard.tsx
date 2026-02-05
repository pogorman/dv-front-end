import React, { useEffect, useState, useCallback } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  Text,
  Badge,
  Subtitle1,
  Body1,
  Caption1,
  Divider,
  Button,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@fluentui/react-components";
import {
  Building24Filled,
  ContactCard24Filled,
  Briefcase24Filled,
  TaskListSquareLtr24Filled,
  Warning24Filled,
  Pin24Regular,
  PinOff16Regular,
  Dismiss24Regular,
  Add16Regular,
  Attach16Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Project, Annotation, NoteEntityType } from "../types";
import { getActionItems, getAccounts, getCustomers, getProjects, getAnnotationsByIds } from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { getPinnedNoteRefs, unpinNote, PinnedNoteRef } from "../utils/pinnedNotes";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  welcomeCard: {
    ...shorthands.padding("32px"),
    backgroundImage: "url('/images/banner-bg.png')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    color: "white",
    ...shorthands.borderRadius("12px"),
  },
  dashboardBody: {
    display: "flex",
    ...shorthands.gap("24px"),
    alignItems: "flex-start",
  },
  dashboardMain: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    ...shorthands.gap("12px"),
  },
  statCard: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("12px"),
    cursor: "pointer",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    ":hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  statIconWrap: {
    width: "36px",
    height: "36px",
    ...shorthands.borderRadius("8px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statNumber: {
    fontSize: "28px",
    fontWeight: "700",
    lineHeight: "1",
    marginBottom: "4px",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sectionCard: {
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("10px", "0px"),
    cursor: "pointer",
    ...shorthands.borderRadius("6px"),
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  nameLink: {
    color: tokens.colorBrandForeground1,
    cursor: "pointer",
    ":hover": {
      textDecoration: "underline",
    },
  },
  pinnedPanel: {
    width: "280px",
    minWidth: "280px",
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
    display: "flex",
    flexDirection: "column",
    alignSelf: "stretch",
  },
  pinnedHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    marginBottom: "16px",
  },
  pinnedList: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("10px"),
    overflowY: "auto",
    flexGrow: 1,
  },
  pinnedNoteItem: {
    ...shorthands.padding("12px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  pinnedNotePreview: {
    display: "-webkit-box",
    WebkitLineClamp: 3,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.4",
  },
  pinnedNoteDate: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "4px",
  },
  pinnedNoteAccount: {
    fontSize: "11px",
    color: tokens.colorBrandForeground1,
    marginBottom: "2px",
    fontWeight: "600",
  },
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Pinned notes state
  const [pinnedRefs, setPinnedRefs] = useState<PinnedNoteRef[]>(() => getPinnedNoteRefs());
  const [pinnedAnnotations, setPinnedAnnotations] = useState<Annotation[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{ annotation: Annotation; entityName: string; entityType: NoteEntityType } | null>(null);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    getCustomers().then(setContacts).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
    getActionItems().then(setActionItems).catch(console.error);
  }, []);

  const loadPinnedAnnotations = useCallback(async () => {
    if (pinnedRefs.length === 0) {
      setPinnedAnnotations([]);
      return;
    }
    try {
      const ids = pinnedRefs.map((r) => r.annotationid);
      const data = await getAnnotationsByIds(ids);
      setPinnedAnnotations(data);
    } catch (err) {
      console.error("Failed to load pinned notes:", err);
    }
  }, [pinnedRefs]);

  useEffect(() => {
    loadPinnedAnnotations();
  }, [loadPinnedAnnotations]);

  const overdueTasks = actionItems.filter(
    (t) => t.tdvsp_date && new Date(t.tdvsp_date) < new Date()
  );

  const handleUnpin = (annotationid: string) => {
    unpinNote(annotationid);
    setPinnedRefs((prev) => prev.filter((r) => r.annotationid !== annotationid));
    if (selectedNote?.annotation.annotationid === annotationid) {
      setNoteDialogOpen(false);
      setSelectedNote(null);
    }
  };

  const getEntityInfo = (annotationid: string): { entityName: string; entityType: NoteEntityType } => {
    const ref = pinnedRefs.find((r) => r.annotationid === annotationid);
    return {
      entityName: ref?.entityName ?? "",
      entityType: ref?.entityType ?? "account",
    };
  };

  const entityTypeLabels: Record<NoteEntityType, string> = {
    account: "Account",
    project: "Project",
    actionitem: "Action Item",
    idea: "Idea",
  };

  return (
    <div className={styles.container}>
      {/* Welcome Banner */}
      <div className={styles.welcomeCard}>
        <Text
          size={700}
          weight="bold"
          style={{ color: "white", display: "block", marginBottom: 8 }}
        >
          Welcome back
        </Text>
        <Text size={400} style={{ color: "rgba(255,255,255,0.85)" }}>
          Here's an overview of your customers, activities, and tasks.
        </Text>
      </div>

      {/* Main body with optional pinned notes sidebar */}
      <div className={styles.dashboardBody}>
        <div className={styles.dashboardMain}>
          {/* Stats Cards */}
          <div className={styles.statsGrid}>
            <Card className={styles.statCard} onClick={() => navigate("/accounts")}>
              <div className={styles.statHeader}>
                <Caption1>Accounts</Caption1>
                <div
                  className={styles.statIconWrap}
                  style={{ backgroundColor: "#e8f0fe" }}
                >
                  <Building24Filled style={{ color: "#0078d4" }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#0078d4" }}>
                {accounts.length}
              </div>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Total accounts
              </Caption1>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate("/contacts")}>
              <div className={styles.statHeader}>
                <Caption1>Contacts</Caption1>
                <div
                  className={styles.statIconWrap}
                  style={{ backgroundColor: "#e8e0f0" }}
                >
                  <ContactCard24Filled style={{ color: "#7c3aed" }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#7c3aed" }}>
                {contacts.length}
              </div>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Total contacts
              </Caption1>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate("/projects")}>
              <div className={styles.statHeader}>
                <Caption1>Projects</Caption1>
                <div
                  className={styles.statIconWrap}
                  style={{ backgroundColor: "#e8f0fe" }}
                >
                  <Briefcase24Filled style={{ color: "#5b5fc7" }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#5b5fc7" }}>
                {projects.length}
              </div>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Total projects
              </Caption1>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate("/tasks")}>
              <div className={styles.statHeader}>
                <Caption1>Open Tasks</Caption1>
                <div
                  className={styles.statIconWrap}
                  style={{ backgroundColor: "#e6f4ea" }}
                >
                  <TaskListSquareLtr24Filled style={{ color: "#107c10" }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#107c10" }}>
                {actionItems.length}
              </div>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Action items pending
              </Caption1>
            </Card>

            <Card className={styles.statCard} onClick={() => navigate("/tasks")}>
              <div className={styles.statHeader}>
                <Caption1>Overdue</Caption1>
                <div
                  className={styles.statIconWrap}
                  style={{ backgroundColor: "#fde7e9" }}
                >
                  <Warning24Filled style={{ color: "#d13438" }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#d13438" }}>
                {overdueTasks.length}
              </div>
              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                Need attention
              </Caption1>
            </Card>
          </div>

          {/* Detail Sections */}
          <div className={styles.sectionGrid}>
            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Subtitle1>Recent Projects</Subtitle1>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add16Regular />}
                  onClick={() => navigate("/projects")}
                >
                  New
                </Button>
              </div>
              {projects.length === 0 ? (
                <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                  No projects yet
                </Body1>
              ) : (
                projects.slice(0, 4).map((project, i) => (
                  <React.Fragment key={project.tdvsp_projectid}>
                    {i > 0 && <Divider />}
                    <div className={styles.listItem} onClick={() => navigate("/projects")}>
                      <div>
                        <Text weight="semibold" block className={styles.nameLink}>
                          {project.tdvsp_name}
                        </Text>
                        {project.tdvsp_Account?.name && (
                          <Caption1
                            style={{ color: tokens.colorNeutralForeground3 }}
                          >
                            {project.tdvsp_Account.name}
                          </Caption1>
                        )}
                      </div>
                    </div>
                  </React.Fragment>
                ))
              )}
            </Card>

            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Subtitle1>Action Items</Subtitle1>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add16Regular />}
                  onClick={() => navigate("/tasks")}
                >
                  New
                </Button>
              </div>
              {actionItems.length === 0 ? (
                <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                  No action items
                </Body1>
              ) : (
                actionItems.slice(0, 4).map((t, i) => (
                  <React.Fragment key={t.tdvsp_actionitemid}>
                    {i > 0 && <Divider />}
                    <div className={styles.listItem} onClick={() => navigate("/tasks")}>
                      <div>
                        <Text weight="semibold" block className={styles.nameLink}>
                          {t.tdvsp_name}
                        </Text>
                        <Caption1
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          {t.tdvsp_date && `Due: ${formatDate(t.tdvsp_date)}`}
                          {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                        </Caption1>
                      </div>
                      {t.tdvsp_date && (
                        <Badge
                          appearance="filled"
                          color={
                            new Date(t.tdvsp_date) < new Date()
                              ? "danger"
                              : "informative"
                          }
                        >
                          {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                        </Badge>
                      )}
                    </div>
                  </React.Fragment>
                ))
              )}
            </Card>
          </div>
        </div>

        {/* Pinned Notes Panel */}
        {pinnedRefs.length > 0 && (
          <Card className={styles.pinnedPanel}>
            <div className={styles.pinnedHeader}>
              <Pin24Regular />
              <Subtitle1 style={{ flexGrow: 1 }}>Pinned Notes</Subtitle1>
              <Button
                appearance="subtle"
                size="small"
                icon={<Add16Regular />}
                onClick={() => navigate("/accounts")}
                title="Add notes from an account"
              />
            </div>
            <div className={styles.pinnedList}>
              {pinnedAnnotations.map((note) => {
                const entityInfo = getEntityInfo(note.annotationid!);
                return (
                  <div
                    key={note.annotationid}
                    className={styles.pinnedNoteItem}
                    onClick={() => {
                      setSelectedNote({
                        annotation: note,
                        entityName: entityInfo.entityName,
                        entityType: entityInfo.entityType,
                      });
                      setNoteDialogOpen(true);
                    }}
                  >
                    <div className={styles.pinnedNoteAccount}>
                      <span style={{ color: tokens.colorNeutralForeground3, fontWeight: "normal" }}>
                        {entityTypeLabels[entityInfo.entityType]}:
                      </span>{" "}
                      {entityInfo.entityName}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {note.createdon && (
                        <div className={styles.pinnedNoteDate}>
                          {formatDate(note.createdon)}
                        </div>
                      )}
                      {note.isdocument && (
                        <Attach16Regular style={{ color: tokens.colorNeutralForeground3, fontSize: 12 }} />
                      )}
                    </div>
                    {note.subject && (
                      <Text size={300} weight="semibold" block style={{ marginBottom: 4 }}>
                        {note.subject}
                      </Text>
                    )}
                    <div className={styles.pinnedNotePreview}>
                      <Text size={200}>{note.notetext}</Text>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      {/* Note Detail Dialog */}
      <Dialog open={noteDialogOpen} onOpenChange={(_, d) => setNoteDialogOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setNoteDialogOpen(false)}
                />
              }
            >
              {selectedNote?.entityName && (
                <Caption1
                  style={{ color: tokens.colorBrandForeground1, display: "block", marginBottom: 4 }}
                >
                  <span style={{ color: tokens.colorNeutralForeground3 }}>
                    {entityTypeLabels[selectedNote.entityType]}:
                  </span>{" "}
                  {selectedNote.entityName}
                </Caption1>
              )}
              {selectedNote?.annotation.subject || "Note"}
              {selectedNote?.annotation.createdon && (
                <Caption1
                  style={{ color: tokens.colorNeutralForeground3, display: "block", marginTop: 4 }}
                >
                  {formatDate(selectedNote.annotation.createdon)}
                  {selectedNote.annotation.isdocument && (
                    <span style={{ marginLeft: 8 }}>
                      <Attach16Regular style={{ verticalAlign: "middle", marginRight: 4 }} />
                      {selectedNote.annotation.filename}
                    </span>
                  )}
                </Caption1>
              )}
            </DialogTitle>
            <DialogContent>
              <Text style={{ whiteSpace: "pre-wrap" }}>
                {selectedNote?.annotation.notetext}
              </Text>
            </DialogContent>
            <DialogActions>
              <Button
                appearance="secondary"
                icon={<PinOff16Regular />}
                onClick={() => {
                  if (selectedNote) {
                    handleUnpin(selectedNote.annotation.annotationid!);
                  }
                }}
              >
                Unpin
              </Button>
              <Button appearance="primary" onClick={() => setNoteDialogOpen(false)}>
                Close
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
