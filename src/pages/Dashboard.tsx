import React, { useEffect, useRef, useState } from "react";

import {
  makeStyles,
  tokens,
  shorthands,
  Text,

  Subtitle1,
  Body1,
  Caption1,
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
  Tooltip,
} from "@fluentui/react-components";
import {
  Briefcase24Filled,
  Briefcase24Regular,
  Dismiss24Regular,
  VehicleCar16Regular,
  VehicleCar16Filled,
  VehicleCarParking24Filled,
  Delete16Regular,
  CheckboxChecked20Regular,
  Briefcase20Regular,
  PeopleTeam20Regular,
  LightbulbFilament20Regular,
  LightbulbFilament24Filled,
  Flash20Regular,
  Building20Regular,
  Person20Regular,
  Edit24Regular,
  Home24Filled,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Project, Idea, Impact, MeetingSummary, IdeaCategory, ideaCategoryLabels, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, taskPriorityOrder, TaskType, taskTypeLabels } from "../types";
import { NotesTimeline } from "../components/NotesTimeline";
import {
  getActionItems,
  getAccounts,
  getCustomers,
  getProjects,
  getIdeas,
  getImpacts,
  getMeetingSummaries,
  createAccount,
  createCustomer,
  createProject,
  createActionItem,
  createIdea,
  createImpact,
  createMeetingSummary,
  updateActionItem,
  updateIdea,
  updateProject,
  deactivateActionItem,
  deactivateIdea,
} from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";
import { getParkedItems, parkItem, unparkItem, isItemParked, reorderParkedItems, ParkedItemRef } from "../utils/parkingLot";
import { useNotification } from "../context/NotificationContext";
import { getTileBackground, getTileColor, setTileColor, clearTileColor, priorityToColor, priorityToBackground, colorToPriority } from "../utils/tileColors";
import TileColorPicker from "../components/TileColorPicker";

const statusShortLabels: Record<number, string> = {
  468510000: "Pondering",
  468510001: "In Progress",
  468510002: "Pending Comm.",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

const statusColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510002: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510003: { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    marginTop: "-15px",
    height: "calc(100vh - 68px)",
    overflow: "hidden",
  },
  quickCreateBar: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    ...shorthands.padding("6px", "4px"),
    flexShrink: 0,
  },
  quickActionBtn: {
    ...shorthands.borderRadius("4px"),
    fontSize: "11px",
    fontWeight: "500",
    fontFamily: tokens.fontFamilyMonospace,
    minHeight: "28px",
    height: "28px",
    ...shorthands.padding("0px", "8px"),
    border: "1px solid transparent",
    ":hover": {
      filter: "brightness(1.3)",
    },
  },
  dashboardColumns: {
    display: "flex",
    ...shorthands.gap("4px"),
    flexGrow: 1,
    overflow: "hidden",
    minHeight: 0,
  },
  column: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
    boxShadow: "none",
    overflow: "hidden",
    minHeight: 0,
  },
  columnHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    ...shorthands.padding("8px", "10px"),
    flexShrink: 0,
  },
  columnCount: {
    fontSize: "11px",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    marginLeft: "auto",
  },
  columnContent: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    ...shorthands.padding("6px"),
    overflowY: "auto" as const,
    flexGrow: 1,
    minHeight: 0,
  },
  columnItem: {
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.gap("2px"),
    ...shorthands.padding("6px", "6px", "6px", "8px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("6px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    position: "relative" as const,
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  columnItemActions: {
    position: "absolute" as const,
    top: "2px",
    right: "2px",
    display: "flex",
    ...shorthands.gap("0px"),
  },
  nameLink: {
    color: tokens.colorBrandForeground1,
    cursor: "pointer",
    ":hover": {
      textDecoration: "underline",
    },
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
  tooltipContent: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    maxWidth: "300px",
  },
  tooltipDesc: {
    display: "-webkit-box",
    WebkitLineClamp: 4,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
    lineHeight: "1.4",
    color: tokens.colorNeutralForeground2,
    fontSize: "12px",
  },
  tooltipMeta: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
    fontFamily: tokens.fontFamilyMonospace,
  },
});

const parkedEntityLabels: Record<string, string> = {
  actionitem: "Task",
  idea: "Idea",
  account: "Account",
  contact: "Contact",
  project: "Project",
  impact: "Impact",
  summary: "Summary",
};

function applyColumnOrder<T>(items: T[], getId: (t: T) => string, key: string): T[] {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return items;
    const order: string[] = JSON.parse(stored);
    const orderMap = new Map(order.map((id, i) => [id, i]));
    return [...items].sort((a, b) => {
      const ai = orderMap.get(getId(a)) ?? Infinity;
      const bi = orderMap.get(getId(b)) ?? Infinity;
      if (ai === Infinity && bi === Infinity) return 0;
      return ai - bi;
    });
  } catch { return items; }
}

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
  const [, setImpacts] = useState<Impact[]>([]);
  const [, setMeetingSummaries] = useState<MeetingSummary[]>([]);

  // Quick add dialog state
  const [addAccountOpen, setAddAccountOpen] = useState(false);
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [addTaskOpen, setAddTaskOpen] = useState(false);
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);
  const [addImpactOpen, setAddImpactOpen] = useState(false);
  const [addSummaryOpen, setAddSummaryOpen] = useState(false);

  // View/edit dialog state
  const [viewTaskOpen, setViewTaskOpen] = useState(false);
  const [viewingTask, setViewingTask] = useState<ActionItem | null>(null);
  const [viewIdeaOpen, setViewIdeaOpen] = useState(false);
  const [viewingIdea, setViewingIdea] = useState<Idea | null>(null);
  const [viewProjectOpen, setViewProjectOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
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
  const [newIdea, setNewIdea] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" as string, tdvsp_priority: "" as string, accountId: "", projectId: "" });
  const [newImpact, setNewImpact] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "", accountId: "" });
  const [newSummary, setNewSummary] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "", accountId: "", projectId: "" });

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    getCustomers().then(setContacts).catch(console.error);
    getProjects().then(setProjects).catch(console.error);
    getActionItems().then(setActionItems).catch(console.error);
    getIdeas().then(setIdeas).catch(console.error);
    getImpacts().then(setImpacts).catch(console.error);
    getMeetingSummaries().then(setMeetingSummaries).catch(console.error);
  }, []);

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
  const [isDragOverParking, setIsDragOverParking] = useState(false);
  const [workFilter, setWorkFilter] = useState<"work" | "personal">("work");
  const [reorderDrag, setReorderDrag] = useState<{ column: string; id: string; index: number } | null>(null);
  const [dropIndicator, setDropIndicator] = useState<{ column: string; index: number; position: "before" | "after" } | null>(null);
  const [orderVersion, setOrderVersion] = useState(0);
  const [, setColorVersion] = useState(0);
  const dragCounter = useRef(0);
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
      notify("Task created");
    } catch (err) {
      console.error("Failed to add task:", err);
      notify("Failed to add task", undefined, "error");
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
        tdvsp_priority?: TaskPriority;
        "tdvsp_Account@odata.bind"?: string;
        "tdvsp_Project@odata.bind"?: string;
      } = {
        tdvsp_name: newIdea.tdvsp_name,
        tdvsp_description: newIdea.tdvsp_description || undefined,
      };
      if (newIdea.tdvsp_category) {
        payload.tdvsp_category = Number(newIdea.tdvsp_category) as IdeaCategory;
      }
      if (newIdea.tdvsp_priority) {
        payload.tdvsp_priority = Number(newIdea.tdvsp_priority) as TaskPriority;
      }
      if (newIdea.accountId) {
        payload["tdvsp_Account@odata.bind"] = `/accounts(${newIdea.accountId})`;
      }
      if (newIdea.projectId) {
        payload["tdvsp_Project@odata.bind"] = `/tdvsp_Projects(${newIdea.projectId})`;
      }
      await createIdea(payload);
      setAddIdeaOpen(false);
      setNewIdea({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "", tdvsp_priority: "", accountId: "", projectId: "" });
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
        "tdvsp_Project@odata.bind"?: string;
      } = {
        tdvsp_name: newSummary.tdvsp_name,
        tdvsp_date: newSummary.tdvsp_date || undefined,
        tdvsp_summary: newSummary.tdvsp_summary || undefined,
      };
      if (newSummary.accountId) {
        payload["tdvsp_Account@odata.bind"] = `/accounts(${newSummary.accountId})`;
      }
      if (newSummary.projectId) {
        payload["tdvsp_Project@odata.bind"] = `/tdvsp_Projects(${newSummary.projectId})`;
      }
      await createMeetingSummary(payload);
      setAddSummaryOpen(false);
      setNewSummary({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "", accountId: "", projectId: "" });
      getMeetingSummaries().then(setMeetingSummaries).catch(console.error);
      notify("Meeting summary created");
    } catch (err) {
      console.error("Failed to add meeting summary:", err);
      notify("Failed to add meeting summary", undefined, "error");
    } finally {
      setSaving(false);
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

  // View/edit handlers for Tasks
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
      notify("Task updated");
    } catch (err) {
      console.error("Failed to save task:", err);
      notify("Failed to save task", undefined, "error");
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

  // View/edit handlers for Projects
  const openViewProject = (project: Project) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingProject(project);
    setViewProjectOpen(true);
  };

  const openEditProject = (project: Project) => {
    setViewingProject(project);
    setViewProjectOpen(true);
    setEditingId(project.tdvsp_projectid ?? null);
    setEditFormData({
      ...editFormData,
      tdvsp_name: project.tdvsp_name,
      tdvsp_description: project.tdvsp_description ?? "",
      accountId: project.tdvsp_Account?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildProjectEditPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_description?: string;
      "tdvsp_Account@odata.bind"?: string;
    } = {
      tdvsp_name: editFormData.tdvsp_name,
      tdvsp_description: editFormData.tdvsp_description || undefined,
    };
    if (editFormData.accountId) {
      payload["tdvsp_Account@odata.bind"] = `/accounts(${editFormData.accountId})`;
    }
    return payload;
  };

  const handleSaveEditProject = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateProject(editingId, buildProjectEditPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedProjects = await getProjects();
      setProjects(updatedProjects);
      const updated = updatedProjects.find((p) => p.tdvsp_projectid === viewingProject?.tdvsp_projectid);
      if (updated) setViewingProject(updated);
      notify("Project updated");
    } catch (err) {
      console.error("Failed to save project:", err);
      notify("Failed to save project", undefined, "error");
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

  // Drag and drop to parking lot
  const handleDragStart = (e: React.DragEvent, ref: ParkedItemRef, column?: string, index?: number) => {
    e.dataTransfer.setData("application/json", JSON.stringify(ref));
    e.dataTransfer.effectAllowed = "copyMove";
    if (column !== undefined && index !== undefined) {
      setReorderDrag({ column, id: ref.id, index });
    }
  };

  const handleParkingDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current++;
    setIsDragOverParking(true);
  };

  const handleParkingDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOverParking(false);
    }
  };

  const handleParkingDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleParkingDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    setIsDragOverParking(false);
    try {
      const ref: ParkedItemRef = JSON.parse(e.dataTransfer.getData("application/json"));
      if (isItemParked(ref.id)) return;
      const before = getParkedItems().length;
      parkItem(ref);
      const after = getParkedItems();
      setParkedItems(after);
      if (after.length > before) {
        notify(`Parked "${ref.name}"`);
      }
    } catch {
      // Invalid drag data
    }
  };

  // Work & Personal card computed lists
  const dateAsc = (a: ActionItem, b: ActionItem) =>
    new Date(a.tdvsp_date).getTime() - new Date(b.tdvsp_date).getTime();

  const workItems = actionItems
    .filter((t) => t.tdvsp_tasktype !== (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus))
    .sort(dateAsc);
  const personalItems = actionItems
    .filter((t) => t.tdvsp_tasktype === (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus))
    .sort(dateAsc);
  const displayedItems = workFilter === "work" ? workItems : personalItems;
  const topPriorityDisplay = displayedItems.filter((t) => t.tdvsp_priority === 468510002);
  const otherDisplay = displayedItems.filter((t) => t.tdvsp_priority !== 468510002);

  // Apply stored column orders (orderVersion triggers recalc after reorder)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _ov = orderVersion;
  const activeWorkColumn = workFilter;
  const orderedDisplayItems = applyColumnOrder(
    [...topPriorityDisplay, ...otherDisplay],
    (t) => t.tdvsp_actionitemid!,
    `og-dash-${activeWorkColumn}-order`
  );
  const orderedProjects = applyColumnOrder(projects, (p) => p.tdvsp_projectid!, "og-dash-project-order");
  const orderedIdeas = applyColumnOrder(ideas, (i) => i.tdvsp_ideaid!, "og-dash-idea-order");

  // Reorder within columns
  const handleItemDragOver = (e: React.DragEvent, column: string, index: number) => {
    if (!reorderDrag || reorderDrag.column !== column) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDropIndicator({ column, index, position: e.clientY < midY ? "before" : "after" });
  };

  const handleItemDrop = (e: React.DragEvent, column: string, targetIndex: number) => {
    if (!reorderDrag || reorderDrag.column !== column) return;
    e.preventDefault();
    e.stopPropagation();
    const fromIndex = reorderDrag.index;
    let toIndex = dropIndicator?.position === "after" ? targetIndex + 1 : targetIndex;
    if (fromIndex < toIndex) toIndex--;
    if (fromIndex === toIndex) { setReorderDrag(null); setDropIndicator(null); return; }

    if (column === "parking") {
      reorderParkedItems(fromIndex, toIndex);
      setParkedItems(getParkedItems());
    } else {
      const cfgMap: Record<string, { items: { id: string }[]; storageKey: string }> = {
        work: { items: orderedDisplayItems.map((t) => ({ id: t.tdvsp_actionitemid! })), storageKey: "og-dash-work-order" },
        personal: { items: orderedDisplayItems.map((t) => ({ id: t.tdvsp_actionitemid! })), storageKey: "og-dash-personal-order" },
        projects: { items: orderedProjects.map((p) => ({ id: p.tdvsp_projectid! })), storageKey: "og-dash-project-order" },
        ideas: { items: orderedIdeas.map((i) => ({ id: i.tdvsp_ideaid! })), storageKey: "og-dash-idea-order" },
      };
      const cfg = cfgMap[column];
      if (cfg) {
        const ids = cfg.items.map((x) => x.id);
        const [moved] = ids.splice(fromIndex, 1);
        ids.splice(toIndex, 0, moved);
        localStorage.setItem(cfg.storageKey, JSON.stringify(ids));
      }
    }
    setOrderVersion((v) => v + 1);
    setReorderDrag(null);
    setDropIndicator(null);
  };

  const handleDragEnd = () => { setReorderDrag(null); setDropIndicator(null); };

  const getDropStyle = (column: string, index: number): React.CSSProperties => {
    if (!dropIndicator || dropIndicator.column !== column || dropIndicator.index !== index) return {};
    const colors: Record<string, string> = { parking: "#84cc16", work: "#f87171", personal: "#22d3ee", projects: "#4a9eff", ideas: "#a78bfa" };
    const color = colors[column] || "#4a9eff";
    return dropIndicator.position === "before" ? { boxShadow: `0 -2px 0 0 ${color}` } : { boxShadow: `0 2px 0 0 ${color}` };
  };

  return (
    <div className={styles.container}>
      {/* Quick Create Title Bar */}
      <div className={styles.quickCreateBar}>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<CheckboxChecked20Regular />} onClick={() => setAddTaskOpen(true)} style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }}>task</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<LightbulbFilament20Regular />} onClick={() => setAddIdeaOpen(true)} style={{ backgroundColor: "rgba(167,139,250,0.12)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.25)" }}>idea</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Flash20Regular />} onClick={() => setAddImpactOpen(true)} style={{ backgroundColor: "rgba(245,158,11,0.12)", color: "#f59e0b", borderColor: "rgba(245,158,11,0.25)" }}>impact</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Building20Regular />} onClick={() => setAddAccountOpen(true)} style={{ backgroundColor: "rgba(61,214,140,0.12)", color: "#3dd68c", borderColor: "rgba(61,214,140,0.25)" }}>account</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Person20Regular />} onClick={() => setAddContactOpen(true)} style={{ backgroundColor: "rgba(34,211,238,0.12)", color: "#22d3ee", borderColor: "rgba(34,211,238,0.25)" }}>contact</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<Briefcase20Regular />} onClick={() => setAddProjectOpen(true)} style={{ backgroundColor: "rgba(232,121,249,0.12)", color: "#e879f9", borderColor: "rgba(232,121,249,0.25)" }}>project</Button>
        <Button className={styles.quickActionBtn} size="small" appearance="subtle" icon={<PeopleTeam20Regular />} onClick={() => setAddSummaryOpen(true)} style={{ backgroundColor: "rgba(251,146,60,0.12)", color: "#fb923c", borderColor: "rgba(251,146,60,0.25)" }}>summary</Button>
      </div>


      {/* Four Column Layout */}
      <div className={styles.dashboardColumns}>
        {/* Column 1: Parking Lot */}
        <div
          className={styles.column}
          style={{
            flex: 1,
            borderLeftColor: "#84cc16",
            ...(isDragOverParking ? { backgroundColor: "rgba(132, 204, 22, 0.08)", borderColor: "rgba(132, 204, 22, 0.4)", transition: "background-color 0.15s, border-color 0.15s" } : { transition: "background-color 0.15s, border-color 0.15s" }),
          }}
          onDragEnter={handleParkingDragEnter}
          onDragLeave={handleParkingDragLeave}
          onDragOver={handleParkingDragOver}
          onDrop={handleParkingDrop}
        >
          <div className={styles.columnHeader}>
            <VehicleCarParking24Filled style={{ color: "#84cc16" }} />
            <Subtitle1>parking lot</Subtitle1>
            <span className={styles.columnCount}>{parkedItems.length}</span>
          </div>
          <div className={styles.columnContent}>
            {parkedItems.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: "11px", padding: "8px 4px" }}>no parked items</Body1>
            ) : (
              parkedItems.map((item, pIdx) => (
                <Tooltip
                  key={`${item.entityType}-${item.id}`}
                  content={
                    <div className={styles.tooltipContent}>
                      <Text weight="semibold" size={300}>{item.name}</Text>
                      <span className={styles.tooltipMeta}>{parkedEntityLabels[item.entityType]}</span>
                    </div>
                  }
                  relationship="description"
                  positioning="after"
                  withArrow
                  showDelay={400}
                >
                  <div
                    className={`${styles.columnItem} tile-color-host`}
                    onClick={() => handleParkedItemClick(item)}
                    draggable
                    onDragStart={(e) => { e.dataTransfer.effectAllowed = "move"; setReorderDrag({ column: "parking", id: item.id, index: pIdx }); }}
                    onDragOver={(e) => handleItemDragOver(e, "parking", pIdx)}
                    onDrop={(e) => handleItemDrop(e, "parking", pIdx)}
                    onDragEnd={handleDragEnd}
                    style={{ ...getDropStyle("parking", pIdx), backgroundColor: getTileBackground(item.entityType, item.id) }}
                  >
                    <TileColorPicker currentColor={getTileColor(item.entityType, item.id)} onColorChange={(color) => { if (color) { setTileColor(item.entityType, item.id, color); } else { clearTileColor(item.entityType, item.id); } setColorVersion((v) => v + 1); }} />
                    <div className={styles.columnItemActions}>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Dismiss24Regular />}
                        onClick={(e) => { e.stopPropagation(); unparkItem(item.id); setParkedItems(getParkedItems()); }}
                        title="Remove"
                      />
                    </div>
                    <Text weight="semibold" style={{ paddingRight: "24px", fontSize: "11px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", lineHeight: "1.3" }}>{item.name}</Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, fontSize: "10px" }}>
                      {parkedEntityLabels[item.entityType]}
                    </Caption1>
                  </div>
                </Tooltip>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Work / Personal */}
        <div className={styles.column} style={{ flex: 2, borderLeftColor: workFilter === "work" ? "#f87171" : "#22d3ee" }}>
          <div className={styles.columnHeader}>
            {workFilter === "work" ? <Briefcase24Filled style={{ color: "#f87171" }} /> : <Home24Filled style={{ color: "#22d3ee" }} />}
            <Subtitle1>{workFilter === "work" ? "work" : "personal"}</Subtitle1>
            <span className={styles.columnCount}>{orderedDisplayItems.length}</span>
            <div style={{ display: "flex", gap: "1px", backgroundColor: tokens.colorNeutralBackground3, borderRadius: "4px", padding: "1px", marginLeft: "auto" }}>
              <Button appearance={workFilter === "work" ? "primary" : "subtle"} size="small" onClick={() => setWorkFilter("work")} style={{ minHeight: "20px", height: "20px", minWidth: "auto", fontSize: "10px", fontFamily: tokens.fontFamilyMonospace, padding: "0 6px", borderRadius: "3px" }}>w</Button>
              <Button appearance={workFilter === "personal" ? "primary" : "subtle"} size="small" onClick={() => setWorkFilter("personal")} style={{ minHeight: "20px", height: "20px", minWidth: "auto", fontSize: "10px", fontFamily: tokens.fontFamilyMonospace, padding: "0 6px", borderRadius: "3px" }}>p</Button>
            </div>
          </div>
          <div className={styles.columnContent}>
            {orderedDisplayItems.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: "11px", padding: "8px 4px" }}>no {workFilter} items</Body1>
            ) : (
              orderedDisplayItems.map((t, wIdx) => (
                <Tooltip
                  key={t.tdvsp_actionitemid}
                  content={
                    <div className={styles.tooltipContent}>
                      <Text weight="semibold" size={300}>{t.tdvsp_name}</Text>
                      {t.tdvsp_description && <div className={styles.tooltipDesc}>{t.tdvsp_description}</div>}
                      <div className={styles.tooltipMeta}>
                        {t.tdvsp_date && <div>Date: {formatDate(t.tdvsp_date)}</div>}
                        {t.tdvsp_Customer?.name && <div>Account: {t.tdvsp_Customer.name}</div>}
                        {t.tdvsp_taskstatus != null && <div>Status: {taskStatusLabels[t.tdvsp_taskstatus as TaskStatus]}</div>}
                        {t.tdvsp_priority != null && <div>Priority: {taskPriorityLabels[t.tdvsp_priority as TaskPriority]}</div>}
                      </div>
                    </div>
                  }
                  relationship="description"
                  positioning="above"
                  withArrow
                  showDelay={400}
                >
                  <div
                    className={`${styles.columnItem} tile-color-host`}
                    onClick={() => openViewTask(t)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, { id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }, activeWorkColumn, wIdx)}
                    onDragOver={(e) => handleItemDragOver(e, activeWorkColumn, wIdx)}
                    onDrop={(e) => handleItemDrop(e, activeWorkColumn, wIdx)}
                    onDragEnd={handleDragEnd}
                    style={{ ...getDropStyle(activeWorkColumn, wIdx), backgroundColor: priorityToBackground(t.tdvsp_priority) }}
                  >
                    <TileColorPicker currentColor={priorityToColor(t.tdvsp_priority)} onColorChange={async (color) => { try { await updateActionItem(t.tdvsp_actionitemid!, { tdvsp_priority: colorToPriority(color) ?? undefined }); getActionItems().then(setActionItems).catch(console.error); } catch (err) { console.error(err); } }} />
                    <div className={styles.columnItemActions}>
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={isItemParked(t.tdvsp_actionitemid!) ? <VehicleCar16Filled /> : <VehicleCar16Regular />}
                        onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, entityType: "actionitem", route: `/tasks?view=${t.tdvsp_actionitemid}` }); }}
                        title={isItemParked(t.tdvsp_actionitemid!) ? "Unpark" : "Park"}
                      />
                      <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: t.tdvsp_actionitemid!, name: t.tdvsp_name, type: "actionitem" }); }} title="Deactivate" />
                    </div>
                    <Text weight="semibold" style={{ paddingRight: "40px", fontSize: "11px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", lineHeight: "1.3" }}>{t.tdvsp_name}</Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground2, fontSize: "10px" }}>
                      {t.tdvsp_date && formatDate(t.tdvsp_date)}
                      {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                    </Caption1>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", marginTop: "2px" }}>
                      <div style={{ display: "flex", gap: "4px" }}>
                        {t.tdvsp_priority === 468510002 && (
                          <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 500, backgroundColor: "rgba(248, 113, 113, 0.15)", color: "#f87171", whiteSpace: "nowrap" }}>Top Priority</span>
                        )}
                        {t.tdvsp_date && new Date(t.tdvsp_date) < new Date() && t.tdvsp_priority !== 468510002 && (
                          <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 500, backgroundColor: "rgba(245, 158, 11, 0.15)", color: "#f59e0b", whiteSpace: "nowrap" }}>Overdue</span>
                        )}
                      </div>
                      {t.tdvsp_taskstatus != null && statusColors[t.tdvsp_taskstatus] && (
                        <span style={{ display: "inline-block", padding: "1px 6px", borderRadius: "4px", fontSize: "9px", fontWeight: 500, backgroundColor: statusColors[t.tdvsp_taskstatus].bg, color: statusColors[t.tdvsp_taskstatus].text, whiteSpace: "nowrap" }}>
                          {statusShortLabels[t.tdvsp_taskstatus]}
                        </span>
                      )}
                    </div>
                  </div>
                </Tooltip>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Projects */}
        <div className={styles.column} style={{ flex: 1, borderLeftColor: "#4a9eff" }}>
          <div className={styles.columnHeader}>
            <Briefcase24Regular style={{ color: "#4a9eff" }} />
            <Subtitle1>projects</Subtitle1>
            <span className={styles.columnCount}>{orderedProjects.length}</span>
          </div>
          <div className={styles.columnContent}>
            {orderedProjects.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: "11px", padding: "8px 4px" }}>no projects yet</Body1>
            ) : (
              orderedProjects.map((project, prIdx) => (
                <Tooltip
                  key={project.tdvsp_projectid}
                  content={
                    <div className={styles.tooltipContent}>
                      <Text weight="semibold" size={300}>{project.tdvsp_name}</Text>
                      {project.tdvsp_description && <div className={styles.tooltipDesc}>{project.tdvsp_description}</div>}
                      {project.tdvsp_Account?.name && <span className={styles.tooltipMeta}>{project.tdvsp_Account.name}</span>}
                    </div>
                  }
                  relationship="description"
                  positioning="above"
                  withArrow
                  showDelay={400}
                >
                  <div
                    className={`${styles.columnItem} tile-color-host`}
                    onClick={() => openViewProject(project)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, { id: project.tdvsp_projectid!, name: project.tdvsp_name, entityType: "project", route: `/projects?view=${project.tdvsp_projectid}` }, "projects", prIdx)}
                    onDragOver={(e) => handleItemDragOver(e, "projects", prIdx)}
                    onDrop={(e) => handleItemDrop(e, "projects", prIdx)}
                    onDragEnd={handleDragEnd}
                    style={{ ...getDropStyle("projects", prIdx), backgroundColor: getTileBackground("project", project.tdvsp_projectid!) }}
                  >
                    <TileColorPicker currentColor={getTileColor("project", project.tdvsp_projectid!)} onColorChange={(color) => { if (color) { setTileColor("project", project.tdvsp_projectid!, color); } else { clearTileColor("project", project.tdvsp_projectid!); } setColorVersion((v) => v + 1); }} />
                    <Text weight="semibold" style={{ fontSize: "11px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", lineHeight: "1.3" }}>{project.tdvsp_name}</Text>
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, fontSize: "10px" }}>
                      {project.tdvsp_Account?.name || "—"}
                    </Caption1>
                  </div>
                </Tooltip>
              ))
            )}
          </div>
        </div>

        {/* Column 4: Ideas */}
        <div className={styles.column} style={{ flex: 1, borderLeftColor: "#a78bfa" }}>
          <div className={styles.columnHeader}>
            <LightbulbFilament24Filled style={{ color: "#a78bfa" }} />
            <Subtitle1>ideas</Subtitle1>
            <span className={styles.columnCount}>{orderedIdeas.length}</span>
          </div>
          <div className={styles.columnContent}>
            {orderedIdeas.length === 0 ? (
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: "11px", padding: "8px 4px" }}>no ideas yet</Body1>
            ) : (
              orderedIdeas.map((idea, iIdx) => (
                <div
                  key={idea.tdvsp_ideaid}
                  className={`${styles.columnItem} tile-color-host`}
                  onClick={() => openViewIdea(idea)}
                  draggable
                  onDragStart={(e) => handleDragStart(e, { id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, entityType: "idea", route: `/ideas?view=${idea.tdvsp_ideaid}` }, "ideas", iIdx)}
                  onDragOver={(e) => handleItemDragOver(e, "ideas", iIdx)}
                  onDrop={(e) => handleItemDrop(e, "ideas", iIdx)}
                  onDragEnd={handleDragEnd}
                  style={{ ...getDropStyle("ideas", iIdx), backgroundColor: priorityToBackground(idea.tdvsp_priority) }}
                >
                  <TileColorPicker currentColor={priorityToColor(idea.tdvsp_priority)} onColorChange={async (color) => { try { await updateIdea(idea.tdvsp_ideaid!, { tdvsp_priority: colorToPriority(color) ?? undefined }); getIdeas().then(setIdeas).catch(console.error); } catch (err) { console.error(err); } }} />
                  <div className={styles.columnItemActions}>
                    <Button
                      appearance="subtle"
                      size="small"
                      icon={isItemParked(idea.tdvsp_ideaid!) ? <VehicleCar16Filled /> : <VehicleCar16Regular />}
                      onClick={(e) => { e.stopPropagation(); handleTogglePark({ id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, entityType: "idea", route: `/ideas?view=${idea.tdvsp_ideaid}` }); }}
                      title={isItemParked(idea.tdvsp_ideaid!) ? "Unpark" : "Park"}
                    />
                    <Button appearance="subtle" size="small" icon={<Delete16Regular />} onClick={(e) => { e.stopPropagation(); setDeactivateConfirm({ id: idea.tdvsp_ideaid!, name: idea.tdvsp_name, type: "idea" }); }} title="Deactivate" />
                  </div>
                  <Text weight="semibold" style={{ paddingRight: "40px", fontSize: "11px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden", lineHeight: "1.3" }}>{idea.tdvsp_name}</Text>
                  {idea.tdvsp_category != null && (
                    <Caption1 style={{ color: "#a78bfa", fontSize: "10px", fontFamily: tokens.fontFamilyMonospace }}>
                      {ideaCategoryLabels[idea.tdvsp_category as IdeaCategory]}
                    </Caption1>
                  )}
                  {idea.tdvsp_Account?.name && (
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, fontSize: "10px" }}>
                      {idea.tdvsp_Account.name}
                    </Caption1>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

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

      {/* Add Task Dialog */}
      <Dialog open={addTaskOpen} onOpenChange={(_, d) => setAddTaskOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle>New Task</DialogTitle>
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
                      {taskPriorityOrder.map((value) => (
                        <Option key={value} value={String(value)} text={taskPriorityLabels[value]}>{taskPriorityLabels[value]}</Option>
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
                    <Label>Priority</Label>
                    <Dropdown
                      placeholder="Select priority"
                      value={newIdea.tdvsp_priority ? taskPriorityLabels[Number(newIdea.tdvsp_priority) as TaskPriority] : ""}
                      onOptionSelect={(_, d) => setNewIdea({ ...newIdea, tdvsp_priority: d.optionValue ?? "" })}
                    >
                      {taskPriorityOrder.map((p) => (
                        <Option key={p} value={String(p)}>{taskPriorityLabels[p]}</Option>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Project</Label>
                    <Dropdown
                      placeholder="Select project"
                      value={newIdea.projectId ? projects.find((p) => p.tdvsp_projectid === newIdea.projectId)?.tdvsp_name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewIdea({ ...newIdea, projectId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {projects.map((p) => (
                        <Option key={p.tdvsp_projectid} value={p.tdvsp_projectid!}>{p.tdvsp_name}</Option>
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
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <Label>Project</Label>
                    <Dropdown
                      placeholder="Select project"
                      value={newSummary.projectId ? projects.find((p) => p.tdvsp_projectid === newSummary.projectId)?.tdvsp_name ?? "" : ""}
                      onOptionSelect={(_, d) => setNewSummary({ ...newSummary, projectId: d.optionValue ?? "" })}
                    >
                      <Option value="" text="(None)">(None)</Option>
                      {projects.map((p) => (
                        <Option key={p.tdvsp_projectid} value={p.tdvsp_projectid!}>{p.tdvsp_name}</Option>
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

      {/* View Task Dialog */}
      <Dialog open={viewTaskOpen} onOpenChange={(_, d) => { setViewTaskOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewTaskOpen(false)} />}
            >
              Task Details
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
                            {taskPriorityOrder.map((value) => (
                              <Option key={value} value={String(value)}>{taskPriorityLabels[value]}</Option>
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

      {/* View Project Dialog */}
      <Dialog open={viewProjectOpen} onOpenChange={(_, d) => { setViewProjectOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewProjectOpen(false)} />}
            >
              Project Details
            </DialogTitle>
            <DialogContent>
              {viewingProject && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input value={editFormData.tdvsp_name} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_name: d.value })} />
                      ) : (
                        <Text block size={400} weight="semibold">{viewingProject.tdvsp_name}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea value={editFormData.tdvsp_description} onChange={(_, d) => setEditFormData({ ...editFormData, tdvsp_description: d.value })} rows={4} resize="vertical" />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>{viewingProject.tdvsp_description || "--"}</Text>
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
                        <Text block size={400}>{viewingProject.tdvsp_Account?.name || "--"}</Text>
                      )}
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingProject.tdvsp_projectid!}
                      entityName={viewingProject.tdvsp_name}
                      entityType="project"
                      odataBindKey="objectid_tdvsp_Project@odata.bind"
                      entitySetPath="/tdvsp_Projects"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEditProject} disabled={saving || !editFormData.tdvsp_name.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button appearance="primary" icon={<Edit24Regular />} onClick={() => viewingProject && openEditProject(viewingProject)}>Edit</Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
