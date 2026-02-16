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
  Input,
  Label,
  Dropdown,
  Option,
  Textarea,
} from "@fluentui/react-components";
import {
  Building24Filled,
  ContactCard24Filled,
  Briefcase24Filled,
  TaskListSquareLtr24Filled,
  Pin24Regular,
  PinOff16Regular,
  Dismiss24Regular,
  Add16Regular,
  Attach16Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Project, Idea, Annotation, NoteEntityType, IdeaCategory, ideaCategoryLabels, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels } from "../types";
import {
  getActionItems,
  getAccounts,
  getCustomers,
  getProjects,
  getIdeas,
  getAnnotationsByIds,
  createAccount,
  createCustomer,
  createProject,
  createActionItem,
  createIdea,
  createActivity,
  createImpact,
  createMeetingSummary,
} from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { getPinnedNoteRefs, unpinNote, PinnedNoteRef } from "../utils/pinnedNotes";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    ...shorthands.gap("8px"),
  },
  quickActionBtn: {
    ...shorthands.borderRadius("20px"),
    fontSize: "13px",
    fontWeight: "500",
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
  const [ideas, setIdeas] = useState<Idea[]>([]);

  // Pinned notes state
  const [pinnedRefs, setPinnedRefs] = useState<PinnedNoteRef[]>(() => getPinnedNoteRefs());
  const [pinnedAnnotations, setPinnedAnnotations] = useState<Annotation[]>([]);
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<{ annotation: Annotation; entityName: string; entityType: NoteEntityType } | null>(null);

  // Quick add dialog state
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);
  const [addHvaOpen, setAddHvaOpen] = useState(false);
  const [addImpactOpen, setAddImpactOpen] = useState(false);
  const [addSummaryOpen, setAddSummaryOpen] = useState(false);

  // Form data for quick add dialogs
  const [newAccount, setNewAccount] = useState({ name: "", parentAccountId: "" });
  const [newContact, setNewContact] = useState({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "", accountId: "" });
  const [newProject, setNewProject] = useState({ tdvsp_name: "", tdvsp_description: "", accountId: "" });
  const [newTask, setNewTask] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_description: "", accountId: "" });
  const [newIdea, setNewIdea] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" as string, accountId: "" });
  const [newHva, setNewHva] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
  const [newImpact, setNewImpact] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
  const [newSummary, setNewSummary] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "", accountId: "" });

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    getCustomers().then(setContacts).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
    getActionItems().then(setActionItems).catch(console.error);
    getIdeas().then(setIdeas).catch(console.error);
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

  // Quick add handlers
  const handleAddAccount = async () => {
    if (!newAccount.name) return;
    try {
      const payload: { name: string; "parentaccountid@odata.bind"?: string } = { name: newAccount.name };
      if (newAccount.parentAccountId) {
        payload["parentaccountid@odata.bind"] = `/accounts(${newAccount.parentAccountId})`;
      }
      await createAccount(payload);
      setAddAccountOpen(false);
      setNewAccount({ name: "", parentAccountId: "" });
      getAccounts().then(setAccounts).catch(console.error);
    } catch (err) {
      console.error("Failed to add account:", err);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.firstname || !newContact.lastname) return;
    try {
      const payload: {
        firstname: string;
        lastname: string;
        emailaddress1: string;
        telephone1: string;
        jobtitle: string;
        "parentcustomerid_account@odata.bind"?: string;
      } = {
        firstname: newContact.firstname,
        lastname: newContact.lastname,
        emailaddress1: newContact.emailaddress1,
        telephone1: newContact.telephone1,
        jobtitle: newContact.jobtitle,
      };
      if (newContact.accountId) {
        payload["parentcustomerid_account@odata.bind"] = `/accounts(${newContact.accountId})`;
      }
      await createCustomer(payload);
      setAddContactOpen(false);
      setNewContact({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "", accountId: "" });
      getCustomers().then(setContacts).catch(console.error);
    } catch (err) {
      console.error("Failed to add contact:", err);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_description?: string;
        "tdvsp_Account@odata.bind"?: string;
      } = {
        tdvsp_name: newProject.tdvsp_name,
        tdvsp_description: newProject.tdvsp_description || undefined,
      };
      if (newProject.accountId) {
        payload["tdvsp_Account@odata.bind"] = `/accounts(${newProject.accountId})`;
      }
      await createProject(payload);
      setAddProjectOpen(false);
      setNewProject({ tdvsp_name: "", tdvsp_description: "", accountId: "" });
      getProjects().then(setProjects).catch(console.error);
    } catch (err) {
      console.error("Failed to add project:", err);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_date: string;
        tdvsp_description?: string;
        "tdvsp_Customer@odata.bind"?: string;
      } = {
        tdvsp_name: newTask.tdvsp_name,
        tdvsp_date: newTask.tdvsp_date || new Date().toISOString().split("T")[0],
        tdvsp_description: newTask.tdvsp_description || undefined,
      };
      if (newTask.accountId) {
        payload["tdvsp_Customer@odata.bind"] = `/accounts(${newTask.accountId})`;
      }
      await createActionItem(payload);
      setAddTaskOpen(false);
      setNewTask({ tdvsp_name: "", tdvsp_date: "", tdvsp_description: "", accountId: "" });
      getActionItems().then(setActionItems).catch(console.error);
    } catch (err) {
      console.error("Failed to add action item:", err);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_description?: string;
        tdvsp_category?: IdeaCategory;
        "tdvsp_Account@odata.bind"?: string;
      } = {
        tdvsp_name: newIdea.tdvsp_name,
        tdvsp_description: newIdea.tdvsp_description || undefined,
      };
      if (newIdea.tdvsp_category) {
        payload.tdvsp_category = Number(newIdea.tdvsp_category) as IdeaCategory;
      }
      if (newIdea.accountId) {
        payload["tdvsp_Account@odata.bind"] = `/accounts(${newIdea.accountId})`;
      }
      await createIdea(payload);
      setAddIdeaOpen(false);
      setNewIdea({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "", accountId: "" });
    } catch (err) {
      console.error("Failed to add idea:", err);
    }
  };

  const handleAddHva = async () => {
    if (!newHva.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_description: string;
        tdvsp_date: string;
        "tdvsp_Customer@odata.bind"?: string;
      } = {
        tdvsp_name: newHva.tdvsp_name,
        tdvsp_description: newHva.tdvsp_description,
        tdvsp_date: newHva.tdvsp_date || new Date().toISOString().split("T")[0],
      };
      if (newHva.accountId) {
        payload["tdvsp_Customer@odata.bind"] = `/accounts(${newHva.accountId})`;
      }
      await createActivity(payload);
      setAddHvaOpen(false);
      setNewHva({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
    } catch (err) {
      console.error("Failed to add HVA:", err);
    }
  };

  const handleAddImpact = async () => {
    if (!newImpact.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_description: string;
        tdvsp_date: string;
        "tdvsp_Customer@odata.bind"?: string;
      } = {
        tdvsp_name: newImpact.tdvsp_name,
        tdvsp_description: newImpact.tdvsp_description,
        tdvsp_date: newImpact.tdvsp_date || new Date().toISOString().split("T")[0],
      };
      if (newImpact.accountId) {
        payload["tdvsp_Customer@odata.bind"] = `/accounts(${newImpact.accountId})`;
      }
      await createImpact(payload);
      setAddImpactOpen(false);
      setNewImpact({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
    } catch (err) {
      console.error("Failed to add impact:", err);
    }
  };

  const handleAddSummary = async () => {
    if (!newSummary.tdvsp_name) return;
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_date?: string;
        tdvsp_summary?: string;
        "tdvsp_Account@odata.bind"?: string;
      } = {
        tdvsp_name: newSummary.tdvsp_name,
        tdvsp_date: newSummary.tdvsp_date || undefined,
        tdvsp_summary: newSummary.tdvsp_summary || undefined,
      };
      if (newSummary.accountId) {
        payload["tdvsp_Account@odata.bind"] = `/accounts(${newSummary.accountId})`;
      }
      await createMeetingSummary(payload);
      setAddSummaryOpen(false);
      setNewSummary({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "", accountId: "" });
    } catch (err) {
      console.error("Failed to add meeting summary:", err);
    }
  };

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

      {/* Quick Action Buttons */}
      <div className={styles.quickActions}>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddAccountOpen(true)}>Account</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddContactOpen(true)}>Contact</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddProjectOpen(true)}>Project</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddTaskOpen(true)}>Action Item</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddIdeaOpen(true)}>Idea</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddHvaOpen(true)}>HVA</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddImpactOpen(true)}>Impact</Button>
        <Button className={styles.quickActionBtn} appearance="outline" icon={<Add16Regular />} onClick={() => setAddSummaryOpen(true)}>Meeting Summary</Button>
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

                      </div>

          {/* Detail Sections */}
          <div className={styles.sectionGrid}>
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
                          {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                          {t.tdvsp_taskpriority != null && ` · ${taskPriorityLabels[t.tdvsp_taskpriority as TaskPriority] ?? ""}`}
                          {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                        </Caption1>
                      </div>
                      {t.tdvsp_date && (
                        <Badge
                          appearance="filled"
                          color={
                            t.tdvsp_taskstatus === 468510005
                              ? "success"
                              : new Date(t.tdvsp_date) < new Date()
                                ? "danger"
                                : "informative"
                          }
                        >
                          {t.tdvsp_taskstatus === 468510005
                            ? "Complete"
                            : new Date(t.tdvsp_date) < new Date()
                              ? "Overdue"
                              : "Upcoming"}
                        </Badge>
                      )}
                    </div>
                  </React.Fragment>
                ))
              )}
            </Card>

            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Subtitle1>Ideas</Subtitle1>
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add16Regular />}
                  onClick={() => navigate("/ideas")}
                >
                  New
                </Button>
              </div>
              {ideas.length === 0 ? (
                <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                  No ideas yet
                </Body1>
              ) : (
                ideas.slice(0, 5).map((idea, i) => (
                  <React.Fragment key={idea.tdvsp_ideaid}>
                    {i > 0 && <Divider />}
                    <div className={styles.listItem} onClick={() => navigate("/ideas")} style={{ flexDirection: "column", alignItems: "flex-start" }}>
                      <Text weight="semibold" className={styles.nameLink}>
                        {idea.tdvsp_name}
                        {idea.tdvsp_category != null && (
                          <span style={{ fontWeight: 400, color: tokens.colorNeutralForeground3 }}>
                            {" "}&ndash; {ideaCategoryLabels[idea.tdvsp_category as IdeaCategory] ?? ""}
                          </span>
                        )}
                        {idea.tdvsp_Account?.name && (
                          <span style={{ fontWeight: 400, color: tokens.colorNeutralForeground3 }}>
                            {" "}&ndash; {idea.tdvsp_Account.name}
                          </span>
                        )}
                      </Text>
                      {idea.tdvsp_description && (
                        <Caption1 style={{ color: tokens.colorNeutralForeground3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                          {idea.tdvsp_description}
                        </Caption1>
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

      {/* Add Account Dialog */}
      <Dialog open={addAccountOpen} onOpenChange={(_, d) => setAddAccountOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Account</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Account Name</Label>
                  <Input value={newAccount.name} onChange={(_, d) => setNewAccount({ ...newAccount, name: d.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Parent Account</Label>
                  <Dropdown
                    placeholder="Select parent account"
                    value={newAccount.parentAccountId ? accounts.find((a) => a.accountid === newAccount.parentAccountId)?.name ?? "" : ""}
                    onOptionSelect={(_, d) => setNewAccount({ ...newAccount, parentAccountId: d.optionValue ?? "" })}
                  >
                    <Option value="" text="(None)">(None)</Option>
                    {accounts.map((a) => (
                      <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                    ))}
                  </Dropdown>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddAccountOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddAccount} disabled={!newAccount.name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={(_, d) => setAddContactOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Contact</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label required>First Name</Label>
                    <Input value={newContact.firstname} onChange={(_, d) => setNewContact({ ...newContact, firstname: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label required>Last Name</Label>
                    <Input value={newContact.lastname} onChange={(_, d) => setNewContact({ ...newContact, lastname: d.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Email</Label>
                  <Input type="email" value={newContact.emailaddress1} onChange={(_, d) => setNewContact({ ...newContact, emailaddress1: d.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Phone</Label>
                    <Input value={newContact.telephone1} onChange={(_, d) => setNewContact({ ...newContact, telephone1: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Job Title</Label>
                    <Input value={newContact.jobtitle} onChange={(_, d) => setNewContact({ ...newContact, jobtitle: d.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Account</Label>
                  <Dropdown
                    placeholder="Select account"
                    value={newContact.accountId ? accounts.find((a) => a.accountid === newContact.accountId)?.name ?? "" : ""}
                    onOptionSelect={(_, d) => setNewContact({ ...newContact, accountId: d.optionValue ?? "" })}
                  >
                    <Option value="" text="(None)">(None)</Option>
                    {accounts.map((a) => (
                      <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                    ))}
                  </Dropdown>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddContactOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddContact} disabled={!newContact.firstname || !newContact.lastname}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={addProjectOpen} onOpenChange={(_, d) => setAddProjectOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Project</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newProject.tdvsp_name} onChange={(_, d) => setNewProject({ ...newProject, tdvsp_name: d.value })} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Account</Label>
                  <Dropdown
                    placeholder="Select account"
                    value={newProject.accountId ? accounts.find((a) => a.accountid === newProject.accountId)?.name ?? "" : ""}
                    onOptionSelect={(_, d) => setNewProject({ ...newProject, accountId: d.optionValue ?? "" })}
                  >
                    <Option value="" text="(None)">(None)</Option>
                    {accounts.map((a) => (
                      <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                    ))}
                  </Dropdown>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Description</Label>
                  <Textarea value={newProject.tdvsp_description} onChange={(_, d) => setNewProject({ ...newProject, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddProjectOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddProject} disabled={!newProject.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Action Item Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={(_, d) => setAddTaskOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Action Item</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newTask.tdvsp_name} onChange={(_, d) => setNewTask({ ...newTask, tdvsp_name: d.value })} placeholder="What needs to be done?" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Date</Label>
                    <Input type="date" value={newTask.tdvsp_date} onChange={(_, d) => setNewTask({ ...newTask, tdvsp_date: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={newTask.accountId ? accounts.find((a) => a.accountid === newTask.accountId)?.name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewTask({ ...newTask, accountId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Description</Label>
                  <Textarea value={newTask.tdvsp_description} onChange={(_, d) => setNewTask({ ...newTask, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddTaskOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddTask} disabled={!newTask.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Idea Dialog */}
      <Dialog open={addIdeaOpen} onOpenChange={(_, d) => setAddIdeaOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Idea</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newIdea.tdvsp_name} onChange={(_, d) => setNewIdea({ ...newIdea, tdvsp_name: d.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Category</Label>
                    <Dropdown
                      placeholder="Select category"
                      value={newIdea.tdvsp_category ? ideaCategoryLabels[Number(newIdea.tdvsp_category) as IdeaCategory] : ""}
                      onOptionSelect={(_, d) => setNewIdea({ ...newIdea, tdvsp_category: d.optionValue ?? "" })}
                    >
                      {Object.entries(ideaCategoryLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={newIdea.accountId ? accounts.find((a) => a.accountid === newIdea.accountId)?.name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewIdea({ ...newIdea, accountId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Description</Label>
                  <Textarea value={newIdea.tdvsp_description} onChange={(_, d) => setNewIdea({ ...newIdea, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddIdeaOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddIdea} disabled={!newIdea.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add HVA Dialog */}
      <Dialog open={addHvaOpen} onOpenChange={(_, d) => setAddHvaOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New High-Value Activity</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newHva.tdvsp_name} onChange={(_, d) => setNewHva({ ...newHva, tdvsp_name: d.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Date</Label>
                    <Input type="date" value={newHva.tdvsp_date} onChange={(_, d) => setNewHva({ ...newHva, tdvsp_date: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={newHva.accountId ? accounts.find((a) => a.accountid === newHva.accountId)?.name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewHva({ ...newHva, accountId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Description</Label>
                  <Textarea value={newHva.tdvsp_description} onChange={(_, d) => setNewHva({ ...newHva, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddHvaOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddHva} disabled={!newHva.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Impact Dialog */}
      <Dialog open={addImpactOpen} onOpenChange={(_, d) => setAddImpactOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>New Impact</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newImpact.tdvsp_name} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_name: d.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Date</Label>
                    <Input type="date" value={newImpact.tdvsp_date} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_date: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={newImpact.accountId ? accounts.find((a) => a.accountid === newImpact.accountId)?.name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewImpact({ ...newImpact, accountId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Description</Label>
                  <Textarea value={newImpact.tdvsp_description} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddImpactOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddImpact} disabled={!newImpact.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Meeting Summary Dialog */}
      <Dialog open={addSummaryOpen} onOpenChange={(_, d) => setAddSummaryOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "600px", width: "600px" }}>
          <DialogBody>
            <DialogTitle>New Meeting Summary</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label required>Name</Label>
                  <Input value={newSummary.tdvsp_name} onChange={(_, d) => setNewSummary({ ...newSummary, tdvsp_name: d.value })} placeholder="Meeting title or name" />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Date</Label>
                    <Input type="date" value={newSummary.tdvsp_date} onChange={(_, d) => setNewSummary({ ...newSummary, tdvsp_date: d.value })} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={newSummary.accountId ? accounts.find((a) => a.accountid === newSummary.accountId)?.name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewSummary({ ...newSummary, accountId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <Label>Summary</Label>
                  <Textarea
                    value={newSummary.tdvsp_summary}
                    onChange={(_, d) => setNewSummary({ ...newSummary, tdvsp_summary: d.value })}
                    placeholder="Enter meeting summary..."
                    rows={8}
                    style={{ resize: "vertical", minHeight: "150px" }}
                    maxLength={5000}
                  />
                  <Caption1 style={{ color: tokens.colorNeutralForeground3, textAlign: "right" }}>
                    {newSummary.tdvsp_summary.length} / 5000
                  </Caption1>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddSummaryOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddSummary} disabled={!newSummary.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
