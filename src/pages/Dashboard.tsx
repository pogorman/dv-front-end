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
  Spinner,
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
  Home24Filled,
  Warning16Filled,
  ArrowMaximize16Regular,
  LightbulbFilament24Filled,
  Notebook24Filled,
  Flash24Filled,
  Bookmark16Regular,
  Bookmark16Filled,
  Bookmark24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Project, Idea, Impact, MeetingSummary, Annotation, NoteEntityType, IdeaCategory, ideaCategoryLabels, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, TaskType, taskTypeLabels } from "../types";
import {
  getActionItems,
  getAccounts,
  getCustomers,
  getProjects,
  getIdeas,
  getImpacts,
  getMeetingSummaries,
  getAnnotationsByIds,
  createAccount,
  createCustomer,
  createProject,
  createActionItem,
  createIdea,
  createImpact,
  createMeetingSummary,
} from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { getPinnedNoteRefs, unpinNote, PinnedNoteRef } from "../utils/pinnedNotes";
import { getParkedItems, parkItem, unparkItem, isItemParked, ParkedItemRef } from "../utils/parkingLot";
import { useNotification } from "../context/NotificationContext";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("14px"),
  },
  quickCreateSection: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("12px", "16px"),
    backgroundImage: `linear-gradient(135deg, ${tokens.colorBrandBackground}, ${tokens.colorBrandBackground2})`,
    ...shorthands.borderRadius("12px"),
    flexWrap: "wrap",
    boxShadow: tokens.shadow4,
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    ...shorthands.gap("4px"),
  },
  quickActionBtn: {
    ...shorthands.borderRadius("14px"),
    fontSize: "12px",
    fontWeight: "600",
    minHeight: "28px",
    height: "28px",
    ...shorthands.padding("0px", "12px"),
    backgroundColor: "rgba(255,255,255,0.9)",
    color: tokens.colorBrandForeground1,
    ":hover": {
      backgroundColor: "white",
    },
  },
  dashboardBody: {
    display: "flex",
    ...shorthands.gap("16px"),
    alignItems: "flex-start",
  },
  dashboardMain: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("14px"),
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    ...shorthands.gap("6px"),
    "@media (max-width: 900px)": {
      gridTemplateColumns: "repeat(4, 1fr)",
    },
  },
  statCard: {
    ...shorthands.padding("6px", "8px"),
    ...shorthands.borderRadius("8px"),
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
    marginBottom: "1px",
  },
  statIconWrap: {
    width: "20px",
    height: "20px",
    ...shorthands.borderRadius("4px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statNumber: {
    fontSize: "14px",
    fontWeight: "700",
    lineHeight: "1",
    marginBottom: "1px",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("12px"),
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sectionCard: {
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("10px"),
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "4px",
  },
  sectionScrollArea: {
    maxHeight: "180px",
    overflowY: "auto" as const,
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("2px", "0px"),
    cursor: "pointer",
    ...shorthands.borderRadius("4px"),
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
  rightSidebar: {
    width: "280px",
    minWidth: "280px",
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
    alignSelf: "stretch",
  },
  parkingLotPanel: {
    ...shorthands.padding("14px"),
    ...shorthands.borderRadius("10px"),
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  parkingLotHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    marginBottom: "8px",
  },
  parkingLotItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("6px", "8px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("6px"),
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  pinnedPanel: {
    ...shorthands.padding("14px"),
    ...shorthands.borderRadius("10px"),
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
  },
  pinnedHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    marginBottom: "8px",
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
  topPriorityCard: {
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("10px"),
    borderLeft: "4px solid #d13438",
    flex: "1 1 0",
    minWidth: 0,
  },
  topPriorityHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    marginBottom: "4px",
  },
  topPriorityItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("2px", "0px"),
    cursor: "pointer",
    ...shorthands.borderRadius("4px"),
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  personalCard: {
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("10px"),
    borderLeft: "4px solid #0e7c7b",
    flex: "1 1 0",
    minWidth: 0,
  },
  personalHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    marginBottom: "4px",
  },
  cardScrollArea: {
    maxHeight: "180px",
    overflowY: "auto" as const,
  },
  subSectionLabel: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    ...shorthands.padding("2px", "0px"),
  },
  highlightRow: {
    display: "flex",
    ...shorthands.gap("12px"),
    alignItems: "flex-start",
    "@media (max-width: 900px)": {
      flexDirection: "column",
    },
  },
});

const parkedEntityLabels: Record<string, string> = {
  actionitem: "Action Item",
  idea: "Idea",
  account: "Account",
  contact: "Contact",
  project: "Project",
  impact: "Impact",
  summary: "Summary",
};

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [saving, setSaving] = useState(false);
  const [parkedItems, setParkedItems] = useState<ParkedItemRef[]>(() => getParkedItems());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [meetingSummaries, setMeetingSummaries] = useState<MeetingSummary[]>([]);

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
  const [addImpactOpen, setAddImpactOpen] = useState(false);
  const [addSummaryOpen, setAddSummaryOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  // Form data for quick add dialogs
  const [newAccount, setNewAccount] = useState({ name: "", parentAccountId: "" });
  const [newContact, setNewContact] = useState({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "", accountId: "" });
  const [newProject, setNewProject] = useState({ tdvsp_name: "", tdvsp_description: "", accountId: "" });
  const [newTask, setNewTask] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_description: "", accountId: "", tdvsp_taskstatus: "", tdvsp_priority: "", tdvsp_tasktype: "" });
  const [newIdea, setNewIdea] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" as string, accountId: "" });
  const [newImpact, setNewImpact] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
  const [newSummary, setNewSummary] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "", accountId: "" });

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    getCustomers().then(setContacts).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
    getActionItems().then(setActionItems).catch(console.error);
    getIdeas().then(setIdeas).catch(console.error);
    getImpacts().then(setImpacts).catch(console.error);
    getMeetingSummaries().then(setMeetingSummaries).catch(console.error);
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

  // Parking lot handler
  const handleTogglePark = (ref: ParkedItemRef) => {
    if (isItemParked(ref.id)) {
      unparkItem(ref.id);
    } else {
      parkItem(ref);
    }
    setParkedItems(getParkedItems());
  };

  // Quick add handlers
  const handleAddAccount = async () => {
    if (!newAccount.name) return;
    setSaving(true);
    try {
      const payload: { name: string; "parentaccountid@odata.bind"?: string } = { name: newAccount.name };
      if (newAccount.parentAccountId) {
        payload["parentaccountid@odata.bind"] = `/accounts(${newAccount.parentAccountId})`;
      }
      await createAccount(payload);
      setAddAccountOpen(false);
      setNewAccount({ name: "", parentAccountId: "" });
      getAccounts().then(setAccounts).catch(console.error);
      notify("Account created");
    } catch (err) {
      console.error("Failed to add account:", err);
      notify("Failed to add account", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddContact = async () => {
    if (!newContact.firstname || !newContact.lastname) return;
    setSaving(true);
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
      notify("Contact created");
    } catch (err) {
      console.error("Failed to add contact:", err);
      notify("Failed to add contact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddProject = async () => {
    if (!newProject.tdvsp_name) return;
    setSaving(true);
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
      notify("Project created");
    } catch (err) {
      console.error("Failed to add project:", err);
      notify("Failed to add project", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTask.tdvsp_name) return;
    setSaving(true);
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_date: string;
        tdvsp_description?: string;
        tdvsp_taskstatus?: number;
        tdvsp_priority?: number;
        tdvsp_tasktype?: number;
        "tdvsp_Customer@odata.bind"?: string;
      } = {
        tdvsp_name: newTask.tdvsp_name,
        tdvsp_date: newTask.tdvsp_date || new Date().toISOString().split("T")[0],
        tdvsp_description: newTask.tdvsp_description || undefined,
        tdvsp_taskstatus: newTask.tdvsp_taskstatus ? Number(newTask.tdvsp_taskstatus) : undefined,
        tdvsp_priority: newTask.tdvsp_priority ? Number(newTask.tdvsp_priority) : undefined,
        tdvsp_tasktype: newTask.tdvsp_tasktype ? Number(newTask.tdvsp_tasktype) : undefined,
      };
      if (newTask.accountId) {
        payload["tdvsp_Customer@odata.bind"] = `/accounts(${newTask.accountId})`;
      }
      await createActionItem(payload);
      setAddTaskOpen(false);
      setNewTask({ tdvsp_name: "", tdvsp_date: "", tdvsp_description: "", accountId: "", tdvsp_taskstatus: "", tdvsp_priority: "", tdvsp_tasktype: "" });
      getActionItems().then(setActionItems).catch(console.error);
      notify("Action item created");
    } catch (err) {
      console.error("Failed to add action item:", err);
      notify("Failed to add action item", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.tdvsp_name) return;
    setSaving(true);
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
      getIdeas().then(setIdeas).catch(console.error);
      notify("Idea created");
    } catch (err) {
      console.error("Failed to add idea:", err);
      notify("Failed to add idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImpact = async () => {
    if (!newImpact.tdvsp_name) return;
    setSaving(true);
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
      getImpacts().then(setImpacts).catch(console.error);
      notify("Impact created");
    } catch (err) {
      console.error("Failed to add impact:", err);
      notify("Failed to add impact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSummary = async () => {
    if (!newSummary.tdvsp_name) return;
    setSaving(true);
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
      getMeetingSummaries().then(setMeetingSummaries).catch(console.error);
      notify("Meeting summary created");
    } catch (err) {
      console.error("Failed to add meeting summary:", err);
      notify("Failed to add meeting summary", undefined, "error");
    } finally {
      setSaving(false);
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

  // Work & Personal card computed lists
  const workItems = actionItems.filter(
    (t) => t.tdvsp_tasktype !== (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus)
  );
  const topPriorityWork = workItems.filter((t) => t.tdvsp_priority === 468510002);
  const otherWork = workItems.filter((t) => t.tdvsp_priority !== 468510002);

  const personalFilteredItems = actionItems.filter(
    (t) => t.tdvsp_tasktype === (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus)
  );
  const topPriorityPersonal = personalFilteredItems.filter((t) => t.tdvsp_priority === 468510002);
  const otherPersonal = personalFilteredItems.filter((t) => t.tdvsp_priority !== 468510002);

  return (
    <div className={styles.container}>
      <div className={styles.dashboardBody}>
        <div className={styles.dashboardMain}>
      {/* Quick Create Bar */}
      <div className={styles.quickCreateSection}>
        <Text size={400} weight="semibold" style={{ color: "white", whiteSpace: "nowrap" }}>Quick Create</Text>
        <div className={styles.quickActions}>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddTaskOpen(true)}>Action Item</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddProjectOpen(true)}>Project</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddSummaryOpen(true)}>Summary</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddIdeaOpen(true)}>Idea</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddImpactOpen(true)}>Impact</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddAccountOpen(true)}>Account</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="outline" onClick={() => setAddContactOpen(true)}>Contact</Button>
        </div>
      </div>

      {/* Work & Personal Cards — side by side */}
      {(workItems.length > 0 || personalFilteredItems.length > 0) && (
        <div className={styles.highlightRow}>
          {workItems.length > 0 && (
            <Card className={styles.topPriorityCard}>
              <div className={styles.topPriorityHeader}>
                <Briefcase24Filled style={{ color: "#d13438" }} />
                <Subtitle1 style={{ flexGrow: 1 }}>Work</Subtitle1>
                <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={(e) => { e.stopPropagation(); setExpandedCard("work"); }} title="Expand" />
              </div>
              <div className={styles.cardScrollArea}>
                {topPriorityWork.length > 0 && (
                  <>
                    <div className={styles.subSectionLabel}>
                      <Warning16Filled style={{ color: "#d13438" }} />
                      <Text size={200} weight="semibold" style={{ color: "#d13438" }}>Top Priority</Text>
                    </div>
                    {topPriorityWork.map((t, i) => (
                      <React.Fragment key={t.tdvsp_actionitemid}>
                        {i > 0 && <Divider />}
                        <div className={styles.topPriorityItem} onClick={() => navigate(`/tasks?view=${t.tdvsp_actionitemid}`)}>
                          <div style={{ minWidth: 0 }}>
                            <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                              {t.tdvsp_date && formatDate(t.tdvsp_date)}
                              {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                              {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                            </Caption1>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                              onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                              title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                            />
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                )}
                {otherWork.length > 0 && (
                  <>
                    {topPriorityWork.length > 0 && <Divider style={{ margin: "4px 0" }} />}
                    {otherWork.map((t, i) => (
                      <React.Fragment key={t.tdvsp_actionitemid}>
                        {i > 0 && <Divider />}
                        <div className={styles.topPriorityItem} onClick={() => navigate(`/tasks?view=${t.tdvsp_actionitemid}`)}>
                          <div style={{ minWidth: 0 }}>
                            <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                              {t.tdvsp_date && formatDate(t.tdvsp_date)}
                              {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                              {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                            </Caption1>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                              onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                              title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                            />
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
            </Card>
          )}

          {personalFilteredItems.length > 0 && (
            <Card className={styles.personalCard}>
              <div className={styles.personalHeader}>
                <Home24Filled style={{ color: "#0e7c7b" }} />
                <Subtitle1 style={{ flexGrow: 1 }}>Personal</Subtitle1>
                <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={(e) => { e.stopPropagation(); setExpandedCard("personal"); }} title="Expand" />
              </div>
              <div className={styles.cardScrollArea}>
                {topPriorityPersonal.length > 0 && (
                  <>
                    <div className={styles.subSectionLabel}>
                      <Warning16Filled style={{ color: "#d13438" }} />
                      <Text size={200} weight="semibold" style={{ color: "#d13438" }}>Top Priority</Text>
                    </div>
                    {topPriorityPersonal.map((t, i) => (
                      <React.Fragment key={t.tdvsp_actionitemid}>
                        {i > 0 && <Divider />}
                        <div className={styles.topPriorityItem} onClick={() => navigate(`/tasks?view=${t.tdvsp_actionitemid}`)}>
                          <div style={{ minWidth: 0 }}>
                            <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                              {t.tdvsp_date && formatDate(t.tdvsp_date)}
                              {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                            </Caption1>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                              onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                              title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                            />
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                )}
                {otherPersonal.length > 0 && (
                  <>
                    {topPriorityPersonal.length > 0 && <Divider style={{ margin: "4px 0" }} />}
                    {otherPersonal.map((t, i) => (
                      <React.Fragment key={t.tdvsp_actionitemid}>
                        {i > 0 && <Divider />}
                        <div className={styles.topPriorityItem} onClick={() => navigate(`/tasks?view=${t.tdvsp_actionitemid}`)}>
                          <div style={{ minWidth: 0 }}>
                            <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                              {t.tdvsp_date && formatDate(t.tdvsp_date)}
                              {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                            </Caption1>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                            <Button
                              appearance="subtle"
                              size="small"
                              icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                              onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                              title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                            />
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </React.Fragment>
                    ))}
                  </>
                )}
              </div>
            </Card>
          )}
        </div>
      )}

          {/* Stats Tiles */}
          <div className={styles.statsGrid}>
            <Card className={styles.statCard} onClick={() => navigate("/accounts")}>
              <div className={styles.statHeader}>
                <Caption1>Accounts</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#e8f0fe" }}>
                  <Building24Filled style={{ color: "#0078d4", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#0078d4" }}>{accounts.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/contacts")}>
              <div className={styles.statHeader}>
                <Caption1>Contacts</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#e8e0f0" }}>
                  <ContactCard24Filled style={{ color: "#7c3aed", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#7c3aed" }}>{contacts.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/projects")}>
              <div className={styles.statHeader}>
                <Caption1>Projects</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#e8f0fe" }}>
                  <Briefcase24Filled style={{ color: "#5b5fc7", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#5b5fc7" }}>{projects.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/summaries")}>
              <div className={styles.statHeader}>
                <Caption1>Summaries</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#e8f0f0" }}>
                  <Notebook24Filled style={{ color: "#0e7c7b", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#0e7c7b" }}>{meetingSummaries.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/tasks")}>
              <div className={styles.statHeader}>
                <Caption1>Actions</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#e6f4ea" }}>
                  <TaskListSquareLtr24Filled style={{ color: "#107c10", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#107c10" }}>{actionItems.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/ideas")}>
              <div className={styles.statHeader}>
                <Caption1>Ideas</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#fff8e1" }}>
                  <LightbulbFilament24Filled style={{ color: "#c59a00", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#c59a00" }}>{ideas.length}</div>
            </Card>
            <Card className={styles.statCard} onClick={() => navigate("/impacts")}>
              <div className={styles.statHeader}>
                <Caption1>Impacts</Caption1>
                <div className={styles.statIconWrap} style={{ backgroundColor: "#fce4ec" }}>
                  <Flash24Filled style={{ color: "#d13438", fontSize: 14 }} />
                </div>
              </div>
              <div className={styles.statNumber} style={{ color: "#d13438" }}>{impacts.length}</div>
            </Card>
          </div>

          {/* Detail Sections */}
          <div className={styles.sectionGrid}>
            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Subtitle1 style={{ flexGrow: 1 }}>Action Items</Subtitle1>
                <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={() => setExpandedCard("actionItems")} title="Expand" />
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add16Regular />}
                  onClick={() => navigate("/tasks")}
                >
                  New
                </Button>
              </div>
              <div className={styles.sectionScrollArea}>
              {actionItems.length === 0 ? (
                <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                  No action items
                </Body1>
              ) : (
                actionItems.slice(0, 8).map((t, i) => (
                  <React.Fragment key={t.tdvsp_actionitemid}>
                    {i > 0 && <Divider />}
                    <div className={styles.listItem} onClick={() => navigate(`/tasks?view=${t.tdvsp_actionitemid}`)}>
                      <div style={{ minWidth: 0 }}>
                        <Text weight="semibold" block className={styles.nameLink}>
                          {t.tdvsp_name}
                        </Text>
                        <Caption1
                          style={{ color: tokens.colorNeutralForeground3 }}
                        >
                          {t.tdvsp_date && `Due: ${formatDate(t.tdvsp_date)}`}
                          {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                          {t.tdvsp_priority != null && ` · ${taskPriorityLabels[t.tdvsp_priority as TaskPriority] ?? ""}`}
                          {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                        </Caption1>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 2, flexShrink: 0 }}>
                        <Button
                          appearance="subtle"
                          size="small"
                          icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                          onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                          title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                        />
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
                    </div>
                  </React.Fragment>
                ))
              )}
              </div>
            </Card>

            <Card className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <Subtitle1 style={{ flexGrow: 1 }}>Ideas</Subtitle1>
                <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={() => setExpandedCard("ideas")} title="Expand" />
                <Button
                  appearance="subtle"
                  size="small"
                  icon={<Add16Regular />}
                  onClick={() => navigate("/ideas")}
                >
                  New
                </Button>
              </div>
              <div className={styles.sectionScrollArea}>
              {ideas.length === 0 ? (
                <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
                  No ideas yet
                </Body1>
              ) : (
                ideas.slice(0, 8).map((idea, i) => (
                  <React.Fragment key={idea.tdvsp_ideaid}>
                    {i > 0 && <Divider />}
                    <div className={styles.listItem} onClick={() => navigate(`/ideas?view=${idea.tdvsp_ideaid}`)} style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
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
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={isItemParked(idea.tdvsp_ideaid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                        onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, entityType: "idea", route: `/ideas?view=${idea.tdvsp_ideaid}` }); }}
                        title={isItemParked(idea.tdvsp_ideaid!) ? "Unpark" : "Park"}
                        style={{ flexShrink: 0 }}
                      />
                    </div>
                  </React.Fragment>
                ))
              )}
              </div>
            </Card>
          </div>
        </div>

        {/* Right Sidebar */}
        {(parkedItems.length > 0 || pinnedRefs.length > 0) && (
          <div className={styles.rightSidebar}>
            {parkedItems.length > 0 && (
              <Card className={styles.parkingLotPanel}>
                <div className={styles.parkingLotHeader}>
                  <Bookmark24Regular />
                  <Subtitle1 style={{ flexGrow: 1 }}>Parking Lot</Subtitle1>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {parkedItems.map((item) => (
                    <div
                      key={`${item.entityType}-${item.id}`}
                      className={styles.parkingLotItem}
                      onClick={() => navigate(item.route)}
                    >
                      <div style={{ minWidth: 0, overflow: "hidden" }}>
                        <Text weight="semibold" block truncate>{item.name}</Text>
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                          {parkedEntityLabels[item.entityType]}
                        </Caption1>
                      </div>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Dismiss24Regular />}
                        onClick={(e) => {
                          e.stopPropagation();
                          unparkItem(item.id);
                          setParkedItems(getParkedItems());
                        }}
                        title="Remove"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}
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
              <Button appearance="primary" onClick={handleAddAccount} disabled={saving || !newAccount.name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
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
              <Button appearance="primary" onClick={handleAddContact} disabled={saving || !newContact.firstname.trim() || !newContact.lastname.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
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
              <Button appearance="primary" onClick={handleAddProject} disabled={saving || !newProject.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
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
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Status</Label>
                    <Dropdown
                      placeholder="Select status"
                      value={newTask.tdvsp_taskstatus ? taskStatusLabels[Number(newTask.tdvsp_taskstatus) as TaskStatus] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewTask({ ...newTask, tdvsp_taskstatus: d.optionValue ?? "" })}
                    >
                      {Object.entries(taskStatusLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Priority</Label>
                    <Dropdown
                      placeholder="Select priority"
                      value={newTask.tdvsp_priority ? taskPriorityLabels[Number(newTask.tdvsp_priority) as TaskPriority] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewTask({ ...newTask, tdvsp_priority: d.optionValue ?? "" })}
                    >
                      {Object.entries(taskPriorityLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Type</Label>
                    <Dropdown
                      placeholder="Select type"
                      value={newTask.tdvsp_tasktype ? taskTypeLabels[Number(newTask.tdvsp_tasktype) as TaskType] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewTask({ ...newTask, tdvsp_tasktype: d.optionValue ?? "" })}
                    >
                      {Object.entries(taskTypeLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
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
              <Button appearance="primary" onClick={handleAddTask} disabled={saving || !newTask.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
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
              <Button appearance="primary" onClick={handleAddIdea} disabled={saving || !newIdea.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
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
              <Button appearance="primary" onClick={handleAddImpact} disabled={saving || !newImpact.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Meeting Summary Dialog */}
      <Dialog open={addSummaryOpen} onOpenChange={(_, d) => setAddSummaryOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "600px", width: "600px" }}>
          <DialogBody>
            <DialogTitle>New Summary</DialogTitle>
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
              <Button appearance="primary" onClick={handleAddSummary} disabled={saving || !newSummary.tdvsp_name.trim()}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Expanded Card Dialog */}
      <Dialog open={!!expandedCard} onOpenChange={(_, d) => !d.open && setExpandedCard(null)}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw", maxHeight: "80vh" }}>
          <DialogBody style={{ maxHeight: "80vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setExpandedCard(null)} />}
            >
              {expandedCard === "work" && <><Briefcase24Filled style={{ color: "#d13438", marginRight: 8, verticalAlign: "middle" }} />Work</>}
              {expandedCard === "personal" && <><Home24Filled style={{ color: "#0e7c7b", marginRight: 8, verticalAlign: "middle" }} />Personal</>}
              {expandedCard === "actionItems" && "Action Items"}
              {expandedCard === "ideas" && "Ideas"}
            </DialogTitle>
            <DialogContent style={{ flexGrow: 1, overflowY: "auto" }}>
              {expandedCard === "work" && (
                <>
                  {topPriorityWork.length > 0 && (
                    <>
                      <div className={styles.subSectionLabel}>
                        <Warning16Filled style={{ color: "#d13438" }} />
                        <Text size={200} weight="semibold" style={{ color: "#d13438" }}>Top Priority</Text>
                      </div>
                      {topPriorityWork.map((t, i) => (
                        <React.Fragment key={t.tdvsp_actionitemid}>
                          {i > 0 && <Divider />}
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); navigate(`/tasks?view=${t.tdvsp_actionitemid}`); }}>
                            <div style={{ minWidth: 0 }}>
                              <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                {t.tdvsp_date && formatDate(t.tdvsp_date)}
                                {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                                {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                              </Caption1>
                            </div>
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {otherWork.length > 0 && (
                    <>
                      {topPriorityWork.length > 0 && <Divider style={{ margin: "8px 0" }} />}
                      {otherWork.map((t, i) => (
                        <React.Fragment key={t.tdvsp_actionitemid}>
                          {i > 0 && <Divider />}
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); navigate(`/tasks?view=${t.tdvsp_actionitemid}`); }}>
                            <div style={{ minWidth: 0 }}>
                              <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                {t.tdvsp_date && formatDate(t.tdvsp_date)}
                                {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                                {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                              </Caption1>
                            </div>
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {workItems.length === 0 && <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No work items</Body1>}
                </>
              )}
              {expandedCard === "personal" && (
                <>
                  {topPriorityPersonal.length > 0 && (
                    <>
                      <div className={styles.subSectionLabel}>
                        <Warning16Filled style={{ color: "#d13438" }} />
                        <Text size={200} weight="semibold" style={{ color: "#d13438" }}>Top Priority</Text>
                      </div>
                      {topPriorityPersonal.map((t, i) => (
                        <React.Fragment key={t.tdvsp_actionitemid}>
                          {i > 0 && <Divider />}
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); navigate(`/tasks?view=${t.tdvsp_actionitemid}`); }}>
                            <div style={{ minWidth: 0 }}>
                              <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                {t.tdvsp_date && formatDate(t.tdvsp_date)}
                                {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                              </Caption1>
                            </div>
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {otherPersonal.length > 0 && (
                    <>
                      {topPriorityPersonal.length > 0 && <Divider style={{ margin: "8px 0" }} />}
                      {otherPersonal.map((t, i) => (
                        <React.Fragment key={t.tdvsp_actionitemid}>
                          {i > 0 && <Divider />}
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); navigate(`/tasks?view=${t.tdvsp_actionitemid}`); }}>
                            <div style={{ minWidth: 0 }}>
                              <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                              <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                                {t.tdvsp_date && formatDate(t.tdvsp_date)}
                                {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                              </Caption1>
                            </div>
                            {t.tdvsp_date && (
                              <Badge appearance="filled" color={new Date(t.tdvsp_date) < new Date() ? "danger" : "informative"} style={{ flexShrink: 0 }}>
                                {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                              </Badge>
                            )}
                          </div>
                        </React.Fragment>
                      ))}
                    </>
                  )}
                  {personalFilteredItems.length === 0 && <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No personal items</Body1>}
                </>
              )}
              {expandedCard === "actionItems" && (
                <>
                  {actionItems.length === 0 ? (
                    <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No action items</Body1>
                  ) : (
                    actionItems.map((t, i) => (
                      <React.Fragment key={t.tdvsp_actionitemid}>
                        {i > 0 && <Divider />}
                        <div className={styles.listItem} onClick={() => { setExpandedCard(null); navigate(`/tasks?view=${t.tdvsp_actionitemid}`); }}>
                          <div>
                            <Text weight="semibold" block className={styles.nameLink}>{t.tdvsp_name}</Text>
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                              {t.tdvsp_date && `Due: ${formatDate(t.tdvsp_date)}`}
                              {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                              {t.tdvsp_priority != null && ` · ${taskPriorityLabels[t.tdvsp_priority as TaskPriority] ?? ""}`}
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
                </>
              )}
              {expandedCard === "ideas" && (
                <>
                  {ideas.length === 0 ? (
                    <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No ideas yet</Body1>
                  ) : (
                    ideas.map((idea, i) => (
                      <React.Fragment key={idea.tdvsp_ideaid}>
                        {i > 0 && <Divider />}
                        <div className={styles.listItem} onClick={() => { setExpandedCard(null); navigate(`/ideas?view=${idea.tdvsp_ideaid}`); }} style={{ flexDirection: "column", alignItems: "flex-start" }}>
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
                </>
              )}
            </DialogContent>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
