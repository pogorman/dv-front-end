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
  Briefcase24Filled,
  PanelRight20Regular,
  PanelRight20Filled,
  Pin24Regular,
  PinOff16Regular,
  Dismiss24Regular,
  Add16Regular,
  Attach16Regular,
  Home24Filled,
  LightbulbFilament24Filled,
  Warning16Filled,
  ArrowMaximize16Regular,
  Bookmark16Regular,
  Bookmark16Filled,
  VehicleCarParking24Filled,
  Delete16Regular,
  CheckboxChecked20Regular,
  Briefcase20Regular,
  PeopleTeam20Regular,
  LightbulbFilament20Regular,
  Flash20Regular,
  Building20Regular,
  Person20Regular,
  Edit24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Project, Idea, Impact, MeetingSummary, Annotation, NoteEntityType, IdeaCategory, ideaCategoryLabels, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, TaskType, taskTypeLabels } from "../types";
import { NotesTimeline } from "../components/NotesTimeline";
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
  updateActionItem,
  updateIdea,
  deactivateActionItem,
  deactivateIdea,
} from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { getPinnedNoteRefs, unpinNote, PinnedNoteRef } from "../utils/pinnedNotes";
import { getParkedItems, parkItem, unparkItem, isItemParked, ParkedItemRef, MAX_PARKED_ITEMS } from "../utils/parkingLot";
import { useNotification } from "../context/NotificationContext";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    marginTop: "-15px",
  },
  quickCreateSection: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    ...shorthands.padding("10px", "4px"),
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    ...shorthands.borderRadius("8px"),
    flexWrap: "wrap",
  },
  quickActions: {
    display: "flex",
    flexWrap: "wrap",
    ...shorthands.gap("4px"),
    flexGrow: 1,
  },
  quickActionBtn: {
    ...shorthands.borderRadius("4px"),
    fontSize: "11px",
    fontWeight: "500",
    fontFamily: tokens.fontFamilyMonospace,
    minHeight: "32px",
    height: "32px",
    ...shorthands.padding("0px", "10px"),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    flexGrow: 1,
    flexBasis: 0,
    ":hover": {
      backgroundColor: tokens.colorBrandBackground2Hover,
    },
  },
  dashboardBody: {
    display: "flex",
    ...shorthands.gap("4px"),
    alignItems: "flex-start",
  },
  dashboardMain: {
    flexGrow: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
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
    width: "260px",
    minWidth: "260px",
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
    alignSelf: "stretch",
    transition: "width 0.2s ease, min-width 0.2s ease, opacity 0.2s ease",
    overflow: "hidden",
  },
  rightSidebarCollapsed: {
    width: "0px",
    minWidth: "0px",
    opacity: 0,
    ...shorthands.padding("0"),
  },
  parkingLotPanel: {
    ...shorthands.padding("5px", "3px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    ...shorthands.gap("12px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#84cc16",
    boxShadow: "none",
    overflow: "hidden" as const,
  },
  parkingLotHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    flexShrink: 0,
    minWidth: "170px",
  },
  parkingLotGrid: {
    display: "flex",
    ...shorthands.gap("6px"),
    flexGrow: 1,
    overflow: "hidden" as const,
  },
  parkingLotItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    ...shorthands.gap("2px"),
    ...shorthands.padding("3px", "3px", "3px", "7px"),
    width: "160px",
    height: "62px",
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    position: "relative" as const,
    textAlign: "center" as const,
    flexShrink: 0,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  parkingLotItemDismiss: {
    position: "absolute" as const,
    top: "2px",
    right: "2px",
  },
  pinnedPanel: {
    ...shorthands.padding("12px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    minHeight: 0,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: "none",
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
    fontSize: "10px",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    marginBottom: "4px",
  },
  pinnedNoteAccount: {
    fontSize: "10px",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorBrandForeground1,
    marginBottom: "2px",
    fontWeight: "600",
    letterSpacing: "0.5px",
  },
  topPriorityCard: {
    ...shorthands.padding("10px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "column",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#f87171",
    boxShadow: "none",
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
  ideasPanel: {
    ...shorthands.padding("5px", "3px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    ...shorthands.gap("12px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#a78bfa",
    boxShadow: "none",
    overflow: "hidden" as const,
  },
  ideasPanelHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    flexShrink: 0,
    minWidth: "170px",
  },
  ideasPanelGrid: {
    display: "flex",
    ...shorthands.gap("6px"),
    flexGrow: 1,
    overflow: "hidden" as const,
  },
  ideasPanelItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "center",
    ...shorthands.gap("2px"),
    ...shorthands.padding("3px", "3px", "3px", "7px"),
    width: "160px",
    height: "62px",
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    position: "relative" as const,
    flexShrink: 0,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  personalPanel: {
    ...shorthands.padding("5px", "3px"),
    ...shorthands.borderRadius("8px"),
    display: "flex",
    flexDirection: "row" as const,
    alignItems: "center",
    ...shorthands.gap("12px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    borderLeftColor: "#22d3ee",
    boxShadow: "none",
    overflow: "hidden" as const,
  },
  personalPanelHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    flexShrink: 0,
    minWidth: "170px",
  },
  personalPanelGrid: {
    display: "flex",
    ...shorthands.gap("6px"),
    flexGrow: 1,
    overflow: "hidden" as const,
  },
  personalPanelItem: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "center",
    ...shorthands.gap("2px"),
    ...shorthands.padding("3px", "3px", "3px", "7px"),
    width: "160px",
    height: "62px",
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    position: "relative" as const,
    flexShrink: 0,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  cardScrollArea: {
    maxHeight: "600px",
    overflowY: "auto" as const,
    flexGrow: 1,
  },
  workTileGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    ...shorthands.gap("6px"),
  },
  workTile: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    ...shorthands.gap("2px"),
    ...shorthands.padding("3px", "3px", "3px", "7px"),
    width: "calc((100% - 18px) / 4)",
    minWidth: 0,
    height: "108px",
    overflow: "hidden" as const,
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    position: "relative" as const,
    boxSizing: "border-box" as const,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  subSectionLabel: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    ...shorthands.padding("2px", "0px"),
  },
  viewField: {
    marginBottom: "16px",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  viewLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("24px"),
  },
  viewDetails: {
    display: "flex",
    flexDirection: "column",
  },
  viewNotes: {
    display: "flex",
    flexDirection: "column",
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
  const [rightPanelOpen, setRightPanelOpen] = useState(() => {
    const stored = localStorage.getItem("og-right-panel-open");
    return stored !== "false";
  });
  const [parkedItems, setParkedItems] = useState<ParkedItemRef[]>(() => getParkedItems());
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [, setProjects] = useState<Project[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [, setImpacts] = useState<Impact[]>([]);
  const [, setMeetingSummaries] = useState<MeetingSummary[]>([]);

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

  // View/edit dialog state
  const [viewTaskOpen, setViewTaskOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<ActionItem | null>(null);
  const [viewIdeaOpen, setViewIdeaOpen] = useState(false);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    tdvsp_name: "",
    tdvsp_date: "",
    tdvsp_description: "",
    tdvsp_taskstatus: "",
    tdvsp_priority: "",
    tdvsp_tasktype: "",
    customerAccountId: "",
    tdvsp_category: "" as string | IdeaCategory,
    accountId: "",
    contactId: "",
  });

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

  // Dashboard deactivate handler
  const [deactivateConfirm, setDeactivateConfirm] = useState<{ id: string; name: string; type: "actionitem" | "idea" } | null>(null);
  const handleDashboardDeactivate = async () => {
    if (!deactivateConfirm) return;
    setSaving(true);
    try {
      if (deactivateConfirm.type === "actionitem") {
        await deactivateActionItem(deactivateConfirm.id);
        getActionItems().then(setActionItems);
      } else {
        await deactivateIdea(deactivateConfirm.id);
        getIdeas().then(setIdeas);
      }
      unparkItem(deactivateConfirm.id);
      setParkedItems(getParkedItems());
      notify(`Deactivated "${deactivateConfirm.name}"`, "success");
    } catch {
      notify("Failed to deactivate record", "error");
    } finally {
      setSaving(false);
      setDeactivateConfirm(null);
    }
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

  // Category options for Idea view dialog
  const categoryOptions: { value: IdeaCategory; label: string }[] = [
    { value: 468510000, label: "Copilot Studio" },
    { value: 468510001, label: "Canvas Apps" },
    { value: 468510002, label: "Model-Driven Apps" },
    { value: 468510003, label: "Power Automate" },
    { value: 468510004, label: "Power Pages" },
    { value: 468510005, label: "Azure" },
    { value: 468510006, label: "AI General" },
    { value: 468510007, label: "App General" },
    { value: 468510008, label: "Other" },
  ];

  // View/edit handlers for Action Items
  const openViewTask = (item: ActionItem) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingTask(item);
    setViewTaskOpen(true);
  };

  const openEditTask = (item: ActionItem) => {
    setViewingTask(item);
    setViewTaskOpen(true);
    setEditingId(item.tdvsp_actionitemid ?? null);
    setEditFormData({
      ...editFormData,
      tdvsp_name: item.tdvsp_name,
      tdvsp_date: item.tdvsp_date ? item.tdvsp_date.split("T")[0] : "",
      tdvsp_description: item.tdvsp_description ?? "",
      tdvsp_taskstatus: item.tdvsp_taskstatus != null ? String(item.tdvsp_taskstatus) : "",
      tdvsp_priority: item.tdvsp_priority != null ? String(item.tdvsp_priority) : "",
      tdvsp_tasktype: item.tdvsp_tasktype != null ? String(item.tdvsp_tasktype) : "",
      customerAccountId: item.tdvsp_Customer?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildTaskEditPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_date: string;
      tdvsp_description?: string;
      tdvsp_taskstatus?: number;
      tdvsp_priority?: number;
      tdvsp_tasktype?: number;
      "tdvsp_Customer@odata.bind"?: string;
    } = {
      tdvsp_name: editFormData.tdvsp_name,
      tdvsp_date: editFormData.tdvsp_date,
      tdvsp_description: editFormData.tdvsp_description || undefined,
      tdvsp_taskstatus: editFormData.tdvsp_taskstatus ? Number(editFormData.tdvsp_taskstatus) : undefined,
      tdvsp_priority: editFormData.tdvsp_priority ? Number(editFormData.tdvsp_priority) : undefined,
      tdvsp_tasktype: editFormData.tdvsp_tasktype ? Number(editFormData.tdvsp_tasktype) : undefined,
    };
    if (editFormData.customerAccountId) {
      payload["tdvsp_Customer@odata.bind"] = `/accounts(${editFormData.customerAccountId})`;
    }
    return payload;
  };

  const handleSaveEditTask = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateActionItem(editingId, buildTaskEditPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedItems = await getActionItems();
      setActionItems(updatedItems);
      const updated = updatedItems.find((t) => t.tdvsp_actionitemid === viewingTask?.tdvsp_actionitemid);
      if (updated) setViewingTask(updated);
      notify("Action item updated");
    } catch (err) {
      console.error("Failed to save action item:", err);
      notify("Failed to save action item", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  // View/edit handlers for Ideas
  const openViewIdea = (idea: Idea) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingIdea(idea);
    setViewIdeaOpen(true);
  };

  const openEditIdea = (idea: Idea) => {
    setViewingIdea(idea);
    setViewIdeaOpen(true);
    setEditingId(idea.tdvsp_ideaid ?? null);
    setEditFormData({
      ...editFormData,
      tdvsp_name: idea.tdvsp_name,
      tdvsp_description: idea.tdvsp_description ?? "",
      tdvsp_category: idea.tdvsp_category ?? "",
      accountId: idea.tdvsp_Account?.accountid ?? "",
      contactId: idea.tdvsp_Contact?.contactid ?? "",
    });
    setIsEditing(true);
  };

  const buildIdeaEditPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_description?: string;
      tdvsp_category?: IdeaCategory;
      "tdvsp_Account@odata.bind"?: string;
      "tdvsp_Contact@odata.bind"?: string;
    } = {
      tdvsp_name: editFormData.tdvsp_name,
      tdvsp_description: editFormData.tdvsp_description || undefined,
    };
    if (editFormData.tdvsp_category) {
      payload.tdvsp_category = Number(editFormData.tdvsp_category) as IdeaCategory;
    }
    if (editFormData.accountId) {
      payload["tdvsp_Account@odata.bind"] = `/accounts(${editFormData.accountId})`;
    }
    if (editFormData.contactId) {
      payload["tdvsp_Contact@odata.bind"] = `/contacts(${editFormData.contactId})`;
    }
    return payload;
  };

  const handleSaveEditIdea = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateIdea(editingId, buildIdeaEditPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedIdeas = await getIdeas();
      setIdeas(updatedIdeas);
      const updated = updatedIdeas.find((i) => i.tdvsp_ideaid === viewingIdea?.tdvsp_ideaid);
      if (updated) setViewingIdea(updated);
      notify("Idea updated");
    } catch (err) {
      console.error("Failed to save idea:", err);
      notify("Failed to save idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  // Parking lot click handler — opens inline view dialog instead of navigating
  const handleParkedItemClick = (item: ParkedItemRef) => {
    if (item.entityType === "actionitem") {
      const task = actionItems.find((t) => t.tdvsp_actionitemid === item.id);
      if (task) openViewTask(task);
    } else if (item.entityType === "idea") {
      const idea = ideas.find((i) => i.tdvsp_ideaid === item.id);
      if (idea) openViewIdea(idea);
    } else {
      navigate(item.route);
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
  const dateAsc = (a: ActionItem, b: ActionItem) =>
    new Date(a.tdvsp_date).getTime() - new Date(b.tdvsp_date).getTime();

  const workItems = actionItems
    .filter((t) => t.tdvsp_tasktype !== (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus))
    .sort(dateAsc);
  const topPriorityWork = workItems.filter((t) => t.tdvsp_priority === 468510002);
  const otherWork = workItems.filter((t) => t.tdvsp_priority !== 468510002);

  const personalFilteredItems = actionItems
    .filter((t) => t.tdvsp_tasktype === (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus))
    .sort(dateAsc);
  const topPriorityPersonal = personalFilteredItems.filter((t) => t.tdvsp_priority === 468510002);
  const otherPersonal = personalFilteredItems.filter((t) => t.tdvsp_priority !== 468510002);

  return (
    <div className={styles.container}>
      <div className={styles.dashboardBody}>
        <div className={styles.dashboardMain}>
      {/* Quick Create Bar */}
      <div className={styles.quickCreateSection}>
        <Text size={300} weight="semibold" style={{ whiteSpace: "nowrap", fontFamily: tokens.fontFamilyMonospace, letterSpacing: "1.5px", fontSize: "10px" }}>quick create</Text>
        <div className={styles.quickActions}>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<CheckboxChecked20Regular />} onClick={() => setAddTaskOpen(true)}>action item</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<LightbulbFilament20Regular />} onClick={() => setAddIdeaOpen(true)}>idea</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Flash20Regular />} onClick={() => setAddImpactOpen(true)}>impact</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Building20Regular />} onClick={() => setAddAccountOpen(true)}>account</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Person20Regular />} onClick={() => setAddContactOpen(true)}>contact</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Briefcase20Regular />} onClick={() => setAddProjectOpen(true)}>project</Button>
          <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<PeopleTeam20Regular />} onClick={() => setAddSummaryOpen(true)}>summary</Button>
        </div>
        {pinnedRefs.length > 0 && (
          <Button
            appearance="subtle"
            size="small"
            icon={rightPanelOpen ? <PanelRight20Filled /> : <PanelRight20Regular />}
            onClick={() => {
              const next = !rightPanelOpen;
              setRightPanelOpen(next);
              localStorage.setItem("og-right-panel-open", String(next));
            }}
            title={rightPanelOpen ? "Hide sidebar" : "Show sidebar"}
          />
        )}
      </div>


      {/* Parking Lot — full width above tiles */}
        {parkedItems.length > 0 && (
          <Card className={styles.parkingLotPanel}>
            <div className={styles.parkingLotHeader}>
              <VehicleCarParking24Filled style={{ color: "#84cc16" }} />
              <Subtitle1 style={{ flexGrow: 1 }}>parking lot</Subtitle1>
            </div>
            <div className={styles.parkingLotGrid}>
              {parkedItems.map((item) => (
                <div
                  key={`${item.entityType}-${item.id}`}
                  className={styles.parkingLotItem}
                  onClick={() => handleParkedItemClick(item)}
                >
                  <div className={styles.parkingLotItemDismiss}>
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
                  <Text size={200} weight="semibold" truncate style={{ width: "100%", paddingRight: "20px" }}>{item.name}</Text>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                    {parkedEntityLabels[item.entityType]}
                  </Caption1>
                </div>
              ))}
            </div>
          </Card>
        )}

      {/* Ideas Strip — always visible */}
        <Card className={styles.ideasPanel}>
          <div className={styles.ideasPanelHeader}>
            <LightbulbFilament24Filled style={{ color: "#a78bfa" }} />
            <Subtitle1 style={{ flexGrow: 1 }}>ideas</Subtitle1>
            <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={(e) => { e.stopPropagation(); setExpandedCard("ideas"); }} title="Expand" />
          </div>
          <div className={styles.ideasPanelGrid}>
            {ideas.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, padding: "4px 0" }}>No ideas yet</Body1>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea.tdvsp_ideaid}
                  className={styles.ideasPanelItem}
                  onClick={() => openViewIdea(idea)}
                >
                  <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: 0 }}>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={isItemParked(idea.tdvsp_ideaid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                      onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, entityType: "idea", route: `/ideas?view=${idea.tdvsp_ideaid}` }); }}
                      title={isItemParked(idea.tdvsp_ideaid!) ? "Unpark" : "Park"}
                    />
                    <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, type: "idea" }); }} title="Deactivate" />
                  </div>
                  <Text size={200} weight="semibold" truncate style={{ width: "100%", paddingRight: "40px" }}>{idea.tdvsp_name}</Text>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                    {idea.tdvsp_category != null ? ideaCategoryLabels[idea.tdvsp_category as IdeaCategory] : "Idea"}
                  </Caption1>
                </div>
              ))
            )}
          </div>
        </Card>

      {/* Personal Strip — inline tiles below Ideas */}
        <Card className={styles.personalPanel}>
          <div className={styles.personalPanelHeader}>
            <Home24Filled style={{ color: "#22d3ee" }} />
            <Subtitle1 style={{ flexGrow: 1 }}>personal</Subtitle1>
            <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={(e) => { e.stopPropagation(); setExpandedCard("personal"); }} title="Expand" />
          </div>
          <div className={styles.personalPanelGrid}>
            {personalFilteredItems.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, padding: "4px 0" }}>No personal items</Body1>
            ) : (
              personalFilteredItems.map((t) => (
                <div
                  key={t.tdvsp_actionitemid}
                  className={styles.personalPanelItem}
                  onClick={() => openViewTask(t)}
                >
                  <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: 0 }}>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                      onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                      title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                    />
                    <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, type: "actionitem" }); }} title="Deactivate" />
                  </div>
                  <Text size={200} weight="semibold" truncate style={{ width: "100%", paddingRight: "40px" }}>{t.tdvsp_name}</Text>
                  <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                    {t.tdvsp_date && formatDate(t.tdvsp_date)}
                    {t.tdvsp_priority === 468510002 && " · Top Priority"}
                  </Caption1>
                </div>
              ))
            )}
          </div>
        </Card>

      {/* Work Card — tile grid, 5 per row */}
          <Card className={styles.topPriorityCard}>
            <div className={styles.topPriorityHeader}>
              <Briefcase24Filled style={{ color: "#f87171" }} />
              <Subtitle1 style={{ flexGrow: 1 }}>work</Subtitle1>
              <Button appearance="subtle" size="small" icon={<ArrowMaximize16Regular />} onClick={(e) => { e.stopPropagation(); setExpandedCard("work"); }} title="Expand" />
            </div>
            {workItems.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No work items</Body1>
            ) : (
              <div className={styles.workTileGrid}>
                {[...topPriorityWork, ...otherWork].map((t) => (
                  <div
                    key={t.tdvsp_actionitemid}
                    className={styles.workTile}
                    onClick={() => openViewTask(t)}
                  >
                    <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: 0 }}>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                        onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                        title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                      />
                      <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, type: "actionitem" }); }} title="Deactivate" />
                    </div>
                    <Text size={200} weight="semibold" truncate style={{ width: "100%", paddingRight: "40px" }}>{t.tdvsp_name}</Text>
                    <Caption1 truncate style={{ color: tokens.colorNeutralForeground3, width: "100%" }}>
                      {t.tdvsp_date && formatDate(t.tdvsp_date)}
                      {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                    </Caption1>
                    {t.tdvsp_priority === 468510002 && (
                      <Badge appearance="filled" size="small" color="danger">Top Priority</Badge>
                    )}
                    {t.tdvsp_date && new Date(t.tdvsp_date) < new Date() && t.tdvsp_priority !== 468510002 && (
                      <Badge appearance="filled" size="small" color="warning">Overdue</Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Sidebar — Pinned Notes only */}
        {pinnedRefs.length > 0 && (
          <div className={`${styles.rightSidebar} ${!rightPanelOpen ? styles.rightSidebarCollapsed : ""}`}>
            {pinnedRefs.length > 0 && (
              <Card className={styles.pinnedPanel}>
                <div className={styles.pinnedHeader}>
                  <Pin24Regular />
                  <Subtitle1 style={{ flexGrow: 1 }}>pinned notes</Subtitle1>
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
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
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

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={!!deactivateConfirm} onOpenChange={(_, d) => { if (!d.open) setDeactivateConfirm(null); }}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Deactivate Record</DialogTitle>
            <DialogContent>
              Are you sure you want to deactivate <strong>{deactivateConfirm?.name}</strong>?
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setDeactivateConfirm(null)} disabled={saving}>Cancel</Button>
              <Button appearance="primary" onClick={handleDashboardDeactivate} disabled={saving}>
                {saving ? <><Spinner size="tiny" /> Deactivating...</> : "Deactivate"}
              </Button>
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
              {expandedCard === "work" && <><Briefcase24Filled style={{ color: "#d13438", marginRight: 8, verticalAlign: "middle" }} />work</>}
              {expandedCard === "ideas" && <><LightbulbFilament24Filled style={{ color: "#a78bfa", marginRight: 8, verticalAlign: "middle" }} />ideas</>}
              {expandedCard === "personal" && <><Home24Filled style={{ color: "#0e7c7b", marginRight: 8, verticalAlign: "middle" }} />personal</>}
            </DialogTitle>
            <DialogContent style={{ flexGrow: 1, overflowY: "auto" }}>
              {expandedCard === "work" && (
                workItems.length === 0 ? (
                  <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No work items</Body1>
                ) : (
                  <div className={styles.workTileGrid}>
                    {[...topPriorityWork, ...otherWork].map((t) => (
                      <div
                        key={t.tdvsp_actionitemid}
                        className={styles.workTile}
                        onClick={() => { setExpandedCard(null); openViewTask(t); }}
                      >
                        <div style={{ position: "absolute", top: "2px", right: "2px", display: "flex", gap: 0 }}>
                          <Button
                            appearance="subtle"
                            size="small"
                            icon={isItemParked(t.tdvsp_actionitemid!) ? <Bookmark16Filled /> : <Bookmark16Regular />}
                            onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                            title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                          />
                          <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, type: "actionitem" }); }} title="Deactivate" />
                        </div>
                        <Text size={200} weight="semibold" truncate style={{ width: "100%", paddingRight: "40px" }}>{t.tdvsp_name}</Text>
                        <Caption1 truncate style={{ color: tokens.colorNeutralForeground3, width: "100%" }}>
                          {t.tdvsp_date && formatDate(t.tdvsp_date)}
                          {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                        </Caption1>
                        {t.tdvsp_priority === 468510002 && (
                          <Badge appearance="filled" size="small" color="danger">Top Priority</Badge>
                        )}
                        {t.tdvsp_date && new Date(t.tdvsp_date) < new Date() && t.tdvsp_priority !== 468510002 && (
                          <Badge appearance="filled" size="small" color="warning">Overdue</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
              {expandedCard === "personal" && (
                <>
                  {topPriorityPersonal.length > 0 && (
                    <>
                      <div className={styles.subSectionLabel}>
                        <Warning16Filled style={{ color: "#f87171" }} />
                        <Text size={200} weight="semibold" style={{ color: "#f87171" }}>Top Priority</Text>
                      </div>
                      {topPriorityPersonal.map((t, i) => (
                        <React.Fragment key={t.tdvsp_actionitemid}>
                          {i > 0 && <Divider />}
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); openViewTask(t); }}>
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
                          <div className={styles.topPriorityItem} onClick={() => { setExpandedCard(null); openViewTask(t); }}>
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
              {expandedCard === "ideas" && (
                <>
                  {ideas.length === 0 ? (
                    <Body1 style={{ color: tokens.colorNeutralForeground3 }}>No ideas yet</Body1>
                  ) : (
                    ideas.map((idea, i) => (
                      <React.Fragment key={idea.tdvsp_ideaid}>
                        {i > 0 && <Divider />}
                        <div className={styles.listItem} onClick={() => { setExpandedCard(null); openViewIdea(idea); }} style={{ flexDirection: "column", alignItems: "flex-start" }}>
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

      {/* View Action Item Dialog */}
      <Dialog open={viewTaskOpen} onOpenChange={(_, d) => { setViewTaskOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewTaskOpen(false)} />}
            >
              Action Item Details
            </DialogTitle>
            <DialogContent>
              {viewingTask && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input value={editFormData.tdvsp_name} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_name: d.value })} />
                      ) : (
                        <Text block size={400} weight="semibold">{viewingTask.tdvsp_name}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea value={editFormData.tdvsp_description} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_description: d.value })} rows={4} resize="vertical" />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>{viewingTask.tdvsp_description || "--"}</Text>
                      )}
                    </div>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}>
                        <Label>Date</Label>
                        {isEditing ? (
                          <Input type="date" value={editFormData.tdvsp_date} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_date: d.value })} />
                        ) : (
                          <Text block size={400}>{viewingTask.tdvsp_date ? formatDate(viewingTask.tdvsp_date) : "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Task Status</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select status"
                            value={editFormData.tdvsp_taskstatus ? taskStatusLabels[Number(editFormData.tdvsp_taskstatus) as TaskStatus] ?? "" : ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, tdvsp_taskstatus: d.optionValue ?? "" })}
                          >
                            {(Object.entries(taskStatusLabels) as [string, string][]).map(([value, label]) => (
                              <Option key={value} value={value}>{label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingTask.tdvsp_taskstatus != null ? taskStatusLabels[viewingTask.tdvsp_taskstatus as TaskStatus] ?? "--" : "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Priority</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select priority"
                            value={editFormData.tdvsp_priority ? taskPriorityLabels[Number(editFormData.tdvsp_priority) as TaskPriority] ?? "" : ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, tdvsp_priority: d.optionValue ?? "" })}
                          >
                            {(Object.entries(taskPriorityLabels) as [string, string][]).map(([value, label]) => (
                              <Option key={value} value={value}>{label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingTask.tdvsp_priority != null ? taskPriorityLabels[viewingTask.tdvsp_priority as TaskPriority] ?? "--" : "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Task Type</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select type"
                            value={editFormData.tdvsp_tasktype ? taskTypeLabels[Number(editFormData.tdvsp_tasktype) as TaskType] ?? "" : ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, tdvsp_tasktype: d.optionValue ?? "" })}
                          >
                            {(Object.entries(taskTypeLabels) as [string, string][]).map(([value, label]) => (
                              <Option key={value} value={value}>{label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingTask.tdvsp_tasktype != null ? taskTypeLabels[viewingTask.tdvsp_tasktype as TaskType] ?? "--" : "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Customer</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select account"
                            value={accounts.find((a) => a.accountid === editFormData.customerAccountId)?.name ?? ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, customerAccountId: d.optionValue ?? "" })}
                          >
                            <Option value="" text="(None)">(None)</Option>
                            {accounts.map((a) => (
                              <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingTask.tdvsp_Customer?.name || "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Created On</Label>
                        <Text block size={400}>{viewingTask.createdon ? formatDate(viewingTask.createdon) : "--"}</Text>
                      </div>
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingTask.tdvsp_actionitemid!}
                      entityName={viewingTask.tdvsp_name}
                      entityType="actionitem"
                      odataBindKey="objectid_tdvsp_actionitem@odata.bind"
                      entitySetPath="/tdvsp_actionitems"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEditTask} disabled={saving || !editFormData.tdvsp_name.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button appearance="primary" icon={<Edit24Regular />} onClick={() => viewingTask && openEditTask(viewingTask)}>Edit</Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* View Idea Dialog */}
      <Dialog open={viewIdeaOpen} onOpenChange={(_, d) => { setViewIdeaOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewIdeaOpen(false)} />}
            >
              Idea Details
            </DialogTitle>
            <DialogContent>
              {viewingIdea && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input value={editFormData.tdvsp_name} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_name: d.value })} />
                      ) : (
                        <Text block size={400} weight="semibold">{viewingIdea.tdvsp_name}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea value={editFormData.tdvsp_description} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_description: d.value })} rows={4} />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>{viewingIdea.tdvsp_description || "--"}</Text>
                      )}
                    </div>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}>
                        <Label>Category</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select category"
                            value={editFormData.tdvsp_category ? ideaCategoryLabels[editFormData.tdvsp_category as IdeaCategory] : ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, tdvsp_category: d.optionValue ? (Number(d.optionValue) as IdeaCategory) : "" })}
                          >
                            {categoryOptions.map((cat) => (
                              <Option key={cat.value} value={String(cat.value)}>{cat.label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingIdea.tdvsp_category ? ideaCategoryLabels[viewingIdea.tdvsp_category] : "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Account</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select account"
                            value={accounts.find((a) => a.accountid === editFormData.accountId)?.name ?? ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, accountId: d.optionValue ?? "" })}
                          >
                            <Option value="" text="(None)">(None)</Option>
                            {accounts.map((a) => (
                              <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingIdea.tdvsp_Account?.name || "--"}</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Contact</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select contact"
                            value={contacts.find((c) => c.contactid === editFormData.contactId) ? `${contacts.find((c) => c.contactid === editFormData.contactId)!.firstname} ${contacts.find((c) => c.contactid === editFormData.contactId)!.lastname}` : ""}
                            onOptionSelect={(_, d) => setEditFormData({ ...editFormData, contactId: d.optionValue ?? "" })}
                          >
                            <Option value="" text="(None)">(None)</Option>
                            {contacts.map((c) => (
                              <Option key={c.contactid} value={c.contactid!} text={`${c.firstname} ${c.lastname}`}>{c.firstname} {c.lastname}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>{viewingIdea.tdvsp_Contact ? `${viewingIdea.tdvsp_Contact.firstname} ${viewingIdea.tdvsp_Contact.lastname}` : "--"}</Text>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingIdea.tdvsp_ideaid!}
                      entityName={viewingIdea.tdvsp_name}
                      entityType="idea"
                      odataBindKey="objectid_tdvsp_idea@odata.bind"
                      entitySetPath="/tdvsp_ideas"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEditIdea} disabled={saving || !editFormData.tdvsp_name.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button appearance="primary" icon={<Edit24Regular />} onClick={() => viewingIdea && openEditIdea(viewingIdea)}>Edit</Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
