import React, { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  makeStyles,
  shorthands,
  tokens,
  Card,
  Button,
  Input,
  Label,
  Text,
  Subtitle1,
  Caption1,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
  Textarea,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridBody,
  DataGridRow,
  DataGridCell,
  TableColumnDefinition,
  createTableColumn,
  Dropdown,
  Option,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Add16Regular,
  Search24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  Person20Filled,
  CheckboxChecked20Filled,
  LightbulbFilament20Filled,
  Flash20Filled,
  PeopleTeam20Filled,
  Building24Filled,
  TextBulletListLtr20Regular,
  Grid20Regular,
} from "@fluentui/react-icons";
import { Account, Customer, ActionItem, Impact, Idea, MeetingSummary, ideaCategoryLabels, IdeaCategory, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, taskPriorityOrder, TaskType, taskTypeLabels } from "../types";
import { formatDate } from "../utils/formatDate";
import { NotesTimeline } from "../components/NotesTimeline";
import { useNotification } from "../context/NotificationContext";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deactivateAccount,
  getContactsByAccount,
  getActionItemsByAccount,
  getImpactsByAccount,
  getIdeasByAccount,
  getMeetingSummariesByAccount,
  createCustomer,
  createActionItem,
  createImpact,
  createIdea,
  createMeetingSummary,
} from "../services/dataverseService";

const renderBadge = (label: string, colors: { bg: string; text: string }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: 500,
    backgroundColor: colors.bg,
    color: colors.text,
    whiteSpace: "nowrap",
  }}>
    {label}
  </span>
);

const statusColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510002: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510003: { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
};

const statusShortLabels: Record<number, string> = {
  468510000: "Pondering",
  468510001: "In Progress",
  468510002: "Pending Comm.",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

const priorityColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510002: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171" },
  468510003: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
};

const priorityShortLabels: Record<number, string> = {
  468510000: "Low",
  468510001: "Medium",
  468510002: "Top Priority",
  468510003: "High",
};

const categoryColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(167, 139, 250, 0.15)", text: "#a78bfa" },
  468510001: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
  468510002: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510003: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(96, 165, 250, 0.15)", text: "#60a5fa" },
  468510006: { bg: "rgba(244, 114, 182, 0.15)", text: "#f472b6" },
  468510007: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510008: { bg: "rgba(107, 114, 128, 0.15)", text: "#6b7280" },
};

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    ...shorthands.gap("12px"),
  },
  searchBox: {
    minWidth: "280px",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
  },
  card: {
    ...shorthands.padding("0px"),
    ...shorthands.borderRadius("8px"),
    overflow: "hidden" as const,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeft: "3px solid #4a9eff",
    boxShadow: "none",
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    ...shorthands.padding("48px"),
    color: tokens.colorNeutralForeground3,
  },
  nameLink: {
    cursor: "pointer",
    color: tokens.colorBrandForeground1,
    ":hover": {
      textDecoration: "underline",
    },
  },
  viewHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewField: {
    marginBottom: "16px",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  viewThreeCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    ...shorthands.gap("24px"),
  },
  viewColumn: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
  },
  relatedSection: {
    marginTop: "20px",
  },
  relatedHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    marginBottom: "8px",
  },
  relatedList: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
  },
  relatedItem: {
    ...shorthands.padding("8px", "12px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("6px"),
  },
  badge: {
    ...shorthands.padding("2px", "8px"),
    ...shorthands.borderRadius("4px"),
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground2,
    fontSize: "12px",
  },
  tabList: {
    marginBottom: "16px",
  },
  tileGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    ...shorthands.gap("10px"),
  },
  tile: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "flex-start",
    justifyContent: "space-between",
    ...shorthands.padding("12px"),
    width: "220px",
    minHeight: "120px",
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    cursor: "pointer",
    transition: "background-color 0.15s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  tileName: {
    fontWeight: 600,
    fontSize: "13px",
    lineHeight: "1.3",
    wordBreak: "break-word" as const,
    paddingRight: "4px",
  },
  tileMeta: {
    display: "flex",
    flexDirection: "column" as const,
    ...shorthands.gap("4px"),
    width: "100%",
    marginTop: "8px",
  },
  viewToggle: {
    display: "flex",
    ...shorthands.gap("2px"),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius("6px"),
    ...shorthands.padding("2px"),
  },
});

export const Accounts: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentAccountId, setParentAccountId] = useState<string>("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [relatedContacts, setRelatedContacts] = useState<Customer[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ActionItem[]>([]);
  const [relatedImpacts, setRelatedImpacts] = useState<Impact[]>([]);
  const [relatedIdeas, setRelatedIdeas] = useState<Idea[]>([]);
  const [relatedSummaries, setRelatedSummaries] = useState<MeetingSummary[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tiles">(() =>
    (localStorage.getItem("og-accounts-view-mode") as "list" | "tiles") || "list"
  );
  const toggleViewMode = (mode: "list" | "tiles") => {
    setViewMode(mode);
    localStorage.setItem("og-accounts-view-mode", mode);
  };

  // Add new dialogs state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addActionItemOpen, setAddActionItemOpen] = useState(false);
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);
  const [addImpactOpen, setAddImpactOpen] = useState(false);
  const [addSummaryOpen, setAddSummaryOpen] = useState(false);

  // Form data for add new dialogs
  const [newContact, setNewContact] = useState({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "" });
  const [newActionItem, setNewActionItem] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_taskstatus: "", tdvsp_priority: "", tdvsp_tasktype: "" });
  const [newIdea, setNewIdea] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" as string });
  const [newImpact, setNewImpact] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "" });
  const [newSummary, setNewSummary] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "" });

  const loadAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // Auto-open new dialog if ?new=true
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openNew = () => {
    setEditingId(null);
    setName("");
    setParentAccountId("");
    setDialogOpen(true);
  };

  const openView = (account: Account) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingAccount(account);
    setViewDialogOpen(true);
  };

  const openEdit = (account: Account) => {
    setViewingAccount(account);
    setViewDialogOpen(true);
    setEditingId(account.accountid ?? null);
    setName(account.name);
    setParentAccountId(account._parentaccountid_value ?? "");
    setIsEditing(true);
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      const payload: { name: string; "parentaccountid@odata.bind"?: string } = { name };
      if (parentAccountId) {
        payload["parentaccountid@odata.bind"] = `/accounts(${parentAccountId})`;
      }
      await createAccount(payload);
      setDialogOpen(false);
      setName("");
      setParentAccountId("");
      loadAccounts();
      notify("Account created");
    } catch (err) {
      console.error("Failed to save account:", err);
      notify("Failed to create account", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const payload: { name: string; "parentaccountid@odata.bind"?: string | null } = { name };
      if (parentAccountId) {
        payload["parentaccountid@odata.bind"] = `/accounts(${parentAccountId})`;
      } else {
        payload["parentaccountid@odata.bind"] = null;
      }
      await updateAccount(editingId, payload);
      setIsEditing(false);
      setEditingId(null);
      const updatedAccounts = await getAccounts();
      setAccounts(updatedAccounts);
      const updated = updatedAccounts.find((a) => a.accountid === viewingAccount?.accountid);
      if (updated) setViewingAccount(updated);
      notify("Account updated");
    } catch (err) {
      console.error("Failed to save account:", err);
      notify("Failed to update account", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateAccount(id);
      loadAccounts();
      notify("Account deactivated");
    } catch (err) {
      console.error("Failed to deactivate account:", err);
      notify("Failed to deactivate account", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const loadRelatedRecords = useCallback(async (accountId: string) => {
    setLoadingRelated(true);
    try {
      const [contacts, tasks, impacts, ideas, summaries] = await Promise.all([
        getContactsByAccount(accountId),
        getActionItemsByAccount(accountId),
        getImpactsByAccount(accountId),
        getIdeasByAccount(accountId),
        getMeetingSummariesByAccount(accountId),
      ]);
      setRelatedContacts(contacts);
      setRelatedTasks(tasks);
      setRelatedImpacts(impacts);
      setRelatedIdeas(ideas);
      setRelatedSummaries(summaries);
    } catch (err) {
      console.error("Failed to load related records:", err);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    if (viewingAccount?.accountid) {
      loadRelatedRecords(viewingAccount.accountid);
    } else {
      setRelatedContacts([]);
      setRelatedTasks([]);
      setRelatedImpacts([]);
      setRelatedIdeas([]);
      setRelatedSummaries([]);
    }
  }, [viewingAccount, loadRelatedRecords]);

  // Handlers for adding new related records
  const handleAddContact = async () => {
    if (!newContact.firstname || !newContact.lastname || !viewingAccount?.accountid) return;
    setSaving(true);
    try {
      await createCustomer({
        ...newContact,
        "parentcustomerid_account@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddContactOpen(false);
      setNewContact({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "" });
      loadRelatedRecords(viewingAccount.accountid);
      notify("Contact added");
    } catch (err) {
      console.error("Failed to add contact:", err);
      notify("Failed to add contact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddActionItem = async () => {
    if (!newActionItem.tdvsp_name || !viewingAccount?.accountid) return;
    setSaving(true);
    try {
      await createActionItem({
        tdvsp_name: newActionItem.tdvsp_name,
        tdvsp_date: newActionItem.tdvsp_date || new Date().toISOString().split("T")[0],
        tdvsp_taskstatus: newActionItem.tdvsp_taskstatus ? Number(newActionItem.tdvsp_taskstatus) : undefined,
        tdvsp_priority: newActionItem.tdvsp_priority ? Number(newActionItem.tdvsp_priority) : undefined,
        tdvsp_tasktype: newActionItem.tdvsp_tasktype ? Number(newActionItem.tdvsp_tasktype) : undefined,
        "tdvsp_Customer@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddActionItemOpen(false);
      setNewActionItem({ tdvsp_name: "", tdvsp_date: "", tdvsp_taskstatus: "", tdvsp_priority: "", tdvsp_tasktype: "" });
      loadRelatedRecords(viewingAccount.accountid);
      notify("Task added");
    } catch (err) {
      console.error("Failed to add task:", err);
      notify("Failed to add task", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.tdvsp_name || !viewingAccount?.accountid) return;
    setSaving(true);
    try {
      await createIdea({
        tdvsp_name: newIdea.tdvsp_name,
        tdvsp_description: newIdea.tdvsp_description || undefined,
        tdvsp_category: newIdea.tdvsp_category ? Number(newIdea.tdvsp_category) as IdeaCategory : undefined,
        "tdvsp_Account@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddIdeaOpen(false);
      setNewIdea({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" });
      loadRelatedRecords(viewingAccount.accountid);
      notify("Idea added");
    } catch (err) {
      console.error("Failed to add idea:", err);
      notify("Failed to add idea", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImpact = async () => {
    if (!newImpact.tdvsp_name || !viewingAccount?.accountid) return;
    setSaving(true);
    try {
      await createImpact({
        tdvsp_name: newImpact.tdvsp_name,
        tdvsp_description: newImpact.tdvsp_description,
        tdvsp_date: newImpact.tdvsp_date || new Date().toISOString().split("T")[0],
        "tdvsp_Customer@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddImpactOpen(false);
      setNewImpact({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "" });
      loadRelatedRecords(viewingAccount.accountid);
      notify("Impact added");
    } catch (err) {
      console.error("Failed to add impact:", err);
      notify("Failed to add impact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSummary = async () => {
    if (!newSummary.tdvsp_name || !viewingAccount?.accountid) return;
    setSaving(true);
    try {
      await createMeetingSummary({
        tdvsp_name: newSummary.tdvsp_name,
        tdvsp_date: newSummary.tdvsp_date || undefined,
        tdvsp_summary: newSummary.tdvsp_summary || undefined,
        "tdvsp_Account@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddSummaryOpen(false);
      setNewSummary({ tdvsp_name: "", tdvsp_date: "", tdvsp_summary: "" });
      loadRelatedRecords(viewingAccount.accountid);
      notify("Meeting summary added");
    } catch (err) {
      console.error("Failed to add meeting summary:", err);
      notify("Failed to add meeting summary", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredAccounts = accounts.filter((a) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumnDefinition<Account>[] = [
    createTableColumn({
      columnId: "name",
      compare: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
      renderHeaderCell: () => "Account Name",
      renderCell: (item) => (
        <Text
          weight="semibold"
          className={styles.nameLink}
          onClick={() => openView(item)}
        >
          {item.name}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "parentAccount",
      compare: (a, b) => (a.parentaccountid?.name ?? "").localeCompare(b.parentaccountid?.name ?? ""),
      renderHeaderCell: () => "Parent Account",
      renderCell: (item) => (
        <Text style={{ color: tokens.colorNeutralForeground3 }}>
          {item.parentaccountid?.name ?? "--"}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "actions",
      renderHeaderCell: () => "Actions",
      renderCell: (item) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Button
            appearance="subtle"
            icon={<Edit24Regular />}
            size="small"
            title="Edit"
            onClick={() => openEdit(item)}
          />
          <Button
            appearance="subtle"
            icon={<Delete24Regular />}
            size="small"
            title="Deactivate"
            disabled={saving}
            onClick={() => item.accountid && handleDeactivate(item.accountid)}
          />
        </div>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Building24Filled style={{ color: "#4a9eff", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" as const }}>accounts</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <div className={styles.viewToggle}>
          <Button appearance={viewMode === "list" ? "primary" : "subtle"} icon={<TextBulletListLtr20Regular />} size="small" onClick={() => toggleViewMode("list")} aria-label="List view" style={{ minWidth: "auto" }} />
          <Button appearance={viewMode === "tiles" ? "primary" : "subtle"} icon={<Grid20Regular />} size="small" onClick={() => toggleViewMode("tiles")} aria-label="Tile view" style={{ minWidth: "auto" }} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            Add Account
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Account</DialogTitle>
              <DialogContent>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className={styles.formField}>
                    <Label htmlFor="accountname" required>
                      Account Name
                    </Label>
                    <Input
                      id="accountname"
                      value={name}
                      onChange={(_, d) => setName(d.value)}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Parent Account</Label>
                    <Dropdown
                      placeholder="Select parent account"
                      value={
                        parentAccountId
                          ? accounts.find((a) => a.accountid === parentAccountId)?.name ?? ""
                          : ""
                      }
                      selectedOptions={parentAccountId ? [parentAccountId] : []}
                      onOptionSelect={(_, d) =>
                        setParentAccountId(d.optionValue ?? "")
                      }
                    >
                      <Option value="" text="(None)">
                        (None)
                      </Option>
                      {accounts
                        .filter((a) => a.accountid !== editingId)
                        .map((a) => (
                          <Option
                            key={a.accountid}
                            value={a.accountid!}
                            text={a.name}
                          >
                            {a.name}
                          </Option>
                        ))}
                    </Dropdown>
                  </div>
                </div>
              </DialogContent>
              <DialogActions>
                <Button appearance="secondary" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button appearance="primary" onClick={handleSaveNew} disabled={saving || !name}>
                  {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "80vw", width: "80vw" }}>
          <DialogBody>
            <DialogTitle
              action={
                <Button
                  appearance="subtle"
                  icon={<Dismiss24Regular />}
                  onClick={() => setViewDialogOpen(false)}
                />
              }
            >
              <div className={styles.viewHeader}>
                <span>Account Details</span>
              </div>
            </DialogTitle>
            <DialogContent>
              {viewingAccount && (
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {/* Account Name and Parent Account */}
                  <div className={styles.viewGrid}>
                    <div className={styles.viewField}>
                      <Label>Account Name</Label>
                      {isEditing ? (
                        <Input value={name} onChange={(_, d) => setName(d.value)} />
                      ) : (
                        <Text block size={500} weight="semibold">
                          {viewingAccount.name}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Parent Account</Label>
                      {isEditing ? (
                        <Dropdown
                          placeholder="Select parent account"
                          value={parentAccountId ? accounts.find((a) => a.accountid === parentAccountId)?.name ?? "" : ""}
                          selectedOptions={parentAccountId ? [parentAccountId] : []}
                          onOptionSelect={(_, d) => setParentAccountId(d.optionValue ?? "")}
                        >
                          <Option value="" text="(None)">(None)</Option>
                          {accounts.filter((a) => a.accountid !== editingId).map((a) => (
                            <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                          ))}
                        </Dropdown>
                      ) : (
                        <Text block size={400}>
                          {viewingAccount.parentaccountid?.name || "--"}
                        </Text>
                      )}
                    </div>
                  </div>

                  {loadingRelated ? (
                    <Spinner size="small" label="Loading related records..." />
                  ) : (
                    <div className={styles.viewThreeCol}>
                      {/* Column 1: Contacts, Tasks, Ideas */}
                      <div className={styles.viewColumn}>
                        {/* Contacts */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <Person20Filled style={{ color: "#22d3ee" }} />
                            <Subtitle1>Contacts</Subtitle1>
                            <span className={styles.badge}>{relatedContacts.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddContactOpen(true)}>Add</Button>
                          </div>
                          {relatedContacts.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No contacts</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedContacts.map((c) => (
                                <div key={c.contactid} className={styles.relatedItem}>
                                  <Text weight="semibold">{c.firstname} {c.lastname}</Text>
                                  {c.jobtitle && <Caption1 style={{ marginLeft: 8 }}>{c.jobtitle}</Caption1>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Tasks */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <CheckboxChecked20Filled style={{ color: "#f87171" }} />
                            <Subtitle1>Tasks</Subtitle1>
                            <span className={styles.badge}>{relatedTasks.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddActionItemOpen(true)}>Add</Button>
                          </div>
                          {relatedTasks.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No tasks</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedTasks.map((t) => (
                                <div key={t.tdvsp_actionitemid} className={styles.relatedItem}>
                                  <Text weight="semibold">{t.tdvsp_name}</Text>
                                  <div style={{ display: "flex", gap: 6, marginTop: 4, flexWrap: "wrap" }}>
                                    {t.tdvsp_date && <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>{formatDate(t.tdvsp_date)}</Caption1>}
                                    {t.tdvsp_taskstatus != null && statusColors[t.tdvsp_taskstatus] && renderBadge(statusShortLabels[t.tdvsp_taskstatus] ?? "", statusColors[t.tdvsp_taskstatus])}
                                    {t.tdvsp_priority != null && priorityColors[t.tdvsp_priority] && renderBadge(priorityShortLabels[t.tdvsp_priority] ?? "", priorityColors[t.tdvsp_priority])}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ideas */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <LightbulbFilament20Filled style={{ color: "#a78bfa" }} />
                            <Subtitle1>Ideas</Subtitle1>
                            <span className={styles.badge}>{relatedIdeas.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddIdeaOpen(true)}>Add</Button>
                          </div>
                          {relatedIdeas.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No ideas</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedIdeas.map((idea) => (
                                <div key={idea.tdvsp_ideaid} className={styles.relatedItem}>
                                  <Text weight="semibold">{idea.tdvsp_name}</Text>
                                  {idea.tdvsp_category != null && categoryColors[idea.tdvsp_category] && (
                                    <span style={{ marginLeft: 8 }}>{renderBadge(ideaCategoryLabels[idea.tdvsp_category] ?? "", categoryColors[idea.tdvsp_category])}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: Impacts, Summaries */}
                      <div className={styles.viewColumn}>
                        {/* Impacts */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <Flash20Filled style={{ color: "#f59e0b" }} />
                            <Subtitle1>Impacts</Subtitle1>
                            <span className={styles.badge}>{relatedImpacts.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddImpactOpen(true)}>Add</Button>
                          </div>
                          {relatedImpacts.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No impacts</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedImpacts.map((i) => (
                                <div key={i.tdvsp_impactid} className={styles.relatedItem}>
                                  <Text weight="semibold">{i.tdvsp_name}</Text>
                                  {i.tdvsp_date && <span style={{ marginLeft: 8 }}>{renderBadge(formatDate(i.tdvsp_date), { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" })}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Meeting Summaries */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <PeopleTeam20Filled style={{ color: "#3dd68c" }} />
                            <Subtitle1>Summaries</Subtitle1>
                            <span className={styles.badge}>{relatedSummaries.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddSummaryOpen(true)}>Add</Button>
                          </div>
                          {relatedSummaries.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No summaries</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedSummaries.map((s) => (
                                <div key={s.tdvsp_meetingsummaryid} className={styles.relatedItem}>
                                  <Text weight="semibold">{s.tdvsp_name}</Text>
                                  {s.tdvsp_date && <span style={{ marginLeft: 8 }}>{renderBadge(formatDate(s.tdvsp_date), { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" })}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Notes */}
                      <div className={styles.viewColumn}>
                        <NotesTimeline
                          entityId={viewingAccount.accountid!}
                          entityName={viewingAccount.name}
                          entityType="account"
                          odataBindKey="objectid_account@odata.bind"
                          entitySetPath="/accounts"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" onClick={() => setIsEditing(false)}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving || !name}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingAccount && openEdit(viewingAccount)}
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={addContactOpen} onOpenChange={(_, d) => setAddContactOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Contact to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div className={styles.formField}>
                    <Label required>First Name</Label>
                    <Input value={newContact.firstname} onChange={(_, d) => setNewContact({ ...newContact, firstname: d.value })} />
                  </div>
                  <div className={styles.formField}>
                    <Label required>Last Name</Label>
                    <Input value={newContact.lastname} onChange={(_, d) => setNewContact({ ...newContact, lastname: d.value })} />
                  </div>
                </div>
                <div className={styles.formField}>
                  <Label>Email</Label>
                  <Input type="email" value={newContact.emailaddress1} onChange={(_, d) => setNewContact({ ...newContact, emailaddress1: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Phone</Label>
                  <Input value={newContact.telephone1} onChange={(_, d) => setNewContact({ ...newContact, telephone1: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Job Title</Label>
                  <Input value={newContact.jobtitle} onChange={(_, d) => setNewContact({ ...newContact, jobtitle: d.value })} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddContactOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddContact} disabled={saving || !newContact.firstname || !newContact.lastname}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={addActionItemOpen} onOpenChange={(_, d) => setAddActionItemOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Task to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.formField}>
                  <Label required>Name</Label>
                  <Input value={newActionItem.tdvsp_name} onChange={(_, d) => setNewActionItem({ ...newActionItem, tdvsp_name: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Date</Label>
                  <Input type="date" value={newActionItem.tdvsp_date} onChange={(_, d) => setNewActionItem({ ...newActionItem, tdvsp_date: d.value })} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <div className={styles.formField}>
                    <Label>Status</Label>
                    <Dropdown
                      placeholder="Select status"
                      value={newActionItem.tdvsp_taskstatus ? taskStatusLabels[Number(newActionItem.tdvsp_taskstatus) as TaskStatus] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewActionItem({ ...newActionItem, tdvsp_taskstatus: d.optionValue ?? "" })}
                    >
                      {Object.entries(taskStatusLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Priority</Label>
                    <Dropdown
                      placeholder="Select priority"
                      value={newActionItem.tdvsp_priority ? taskPriorityLabels[Number(newActionItem.tdvsp_priority) as TaskPriority] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewActionItem({ ...newActionItem, tdvsp_priority: d.optionValue ?? "" })}
                    >
                      {taskPriorityOrder.map((value) => (
                        <Option key={value} value={String(value)} text={taskPriorityLabels[value]}>{taskPriorityLabels[value]}</Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Type</Label>
                    <Dropdown
                      placeholder="Select type"
                      value={newActionItem.tdvsp_tasktype ? taskTypeLabels[Number(newActionItem.tdvsp_tasktype) as TaskType] ?? "" : ""}
                      onOptionSelect={(_, d) => setNewActionItem({ ...newActionItem, tdvsp_tasktype: d.optionValue ?? "" })}
                    >
                      {Object.entries(taskTypeLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
                      ))}
                    </Dropdown>
                  </div>
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddActionItemOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddActionItem} disabled={saving || !newActionItem.tdvsp_name}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Idea Dialog */}
      <Dialog open={addIdeaOpen} onOpenChange={(_, d) => setAddIdeaOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Idea to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.formField}>
                  <Label required>Name</Label>
                  <Input value={newIdea.tdvsp_name} onChange={(_, d) => setNewIdea({ ...newIdea, tdvsp_name: d.value })} />
                </div>
                <div className={styles.formField}>
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
                <div className={styles.formField}>
                  <Label>Description</Label>
                  <Textarea value={newIdea.tdvsp_description} onChange={(_, d) => setNewIdea({ ...newIdea, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddIdeaOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddIdea} disabled={saving || !newIdea.tdvsp_name}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Impact Dialog */}
      <Dialog open={addImpactOpen} onOpenChange={(_, d) => setAddImpactOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Impact to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.formField}>
                  <Label required>Name</Label>
                  <Input value={newImpact.tdvsp_name} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_name: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Date</Label>
                  <Input type="date" value={newImpact.tdvsp_date} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_date: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Description</Label>
                  <Textarea value={newImpact.tdvsp_description} onChange={(_, d) => setNewImpact({ ...newImpact, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddImpactOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddImpact} disabled={saving || !newImpact.tdvsp_name}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Meeting Summary Dialog */}
      <Dialog open={addSummaryOpen} onOpenChange={(_, d) => setAddSummaryOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "600px", width: "600px" }}>
          <DialogBody>
            <DialogTitle>Add Summary to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.formField}>
                  <Label required>Name</Label>
                  <Input value={newSummary.tdvsp_name} onChange={(_, d) => setNewSummary({ ...newSummary, tdvsp_name: d.value })} placeholder="Meeting title or name" />
                </div>
                <div className={styles.formField}>
                  <Label>Date</Label>
                  <Input type="date" value={newSummary.tdvsp_date} onChange={(_, d) => setNewSummary({ ...newSummary, tdvsp_date: d.value })} />
                </div>
                <div className={styles.formField}>
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
              <Button appearance="primary" onClick={handleAddSummary} disabled={saving || !newSummary.tdvsp_name}>{saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
          <Spinner label="Loading accounts..." />
        </div>
      ) : filteredAccounts.length === 0 ? (
        <div className={styles.emptyState}>
          <Subtitle1>No accounts found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            {accounts.length === 0
              ? "Add your first account to get started."
              : "Try a different search term."}
          </Caption1>
        </div>
      ) : viewMode === "list" ? (
        <Card className={styles.card}>
          <DataGrid
            items={filteredAccounts}
            columns={columns}
            getRowId={(item) => item.accountid ?? item.name}
            sortable
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<Account>>
              {({ item, rowId }) => (
                <DataGridRow<Account> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        </Card>
      ) : (
        <div className={styles.tileGrid}>
          {filteredAccounts.map((account) => (
            <div key={account.accountid} className={styles.tile} onClick={() => openView(account)}>
              <Text className={styles.tileName}>{account.name}</Text>
              <div className={styles.tileMeta}>
                {account.parentaccountid?.name && <Caption1 style={{ color: tokens.colorBrandForeground1 }}>Parent: {account.parentaccountid.name}</Caption1>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
