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
} from "@fluentui/react-icons";
import { Account, Customer, HighValueActivity, ActionItem, Impact, Idea, MeetingSummary, ideaCategoryLabels, IdeaCategory, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, TaskType, taskTypeLabels } from "../types";
import { formatDate } from "../utils/formatDate";
import { NotesTimeline } from "../components/NotesTimeline";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getContactsByAccount,
  getActivitiesByAccount,
  getActionItemsByAccount,
  getImpactsByAccount,
  getIdeasByAccount,
  getMeetingSummariesByAccount,
  createCustomer,
  createActionItem,
  createActivity,
  createImpact,
  createIdea,
  createMeetingSummary,
} from "../services/dataverseService";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
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
  card: {
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
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
  viewDialogContent: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("24px"),
    minHeight: "400px",
  },
  detailsPanel: {
    display: "flex",
    flexDirection: "column",
  },
  timelinePanel: {
    display: "flex",
    flexDirection: "column",
    borderLeft: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingLeft: "24px",
  },
  timelineHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px",
  },
  timelineList: {
    flexGrow: 1,
    overflowY: "auto",
    maxHeight: "300px",
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },
  noteItem: {
    ...shorthands.padding("12px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
  },
  noteDate: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginBottom: "4px",
  },
  noteInput: {
    marginTop: "12px",
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
});

export const Accounts: React.FC = () => {
  const styles = useStyles();
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
  const [relatedActivities, setRelatedActivities] = useState<HighValueActivity[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ActionItem[]>([]);
  const [relatedImpacts, setRelatedImpacts] = useState<Impact[]>([]);
  const [relatedIdeas, setRelatedIdeas] = useState<Idea[]>([]);
  const [relatedSummaries, setRelatedSummaries] = useState<MeetingSummary[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Add new dialogs state
  const [addContactOpen, setAddContactOpen] = useState(false);
  const [addActionItemOpen, setAddActionItemOpen] = useState(false);
  const [addIdeaOpen, setAddIdeaOpen] = useState(false);
  const [addActivityOpen, setAddActivityOpen] = useState(false);
  const [addImpactOpen, setAddImpactOpen] = useState(false);
  const [addSummaryOpen, setAddSummaryOpen] = useState(false);

  // Form data for add new dialogs
  const [newContact, setNewContact] = useState({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "" });
  const [newActionItem, setNewActionItem] = useState({ tdvsp_name: "", tdvsp_date: "", tdvsp_taskstatus: "", tdvsp_priority: "", tdvsp_tasktype: "" });
  const [newIdea, setNewIdea] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_category: "" as string });
  const [newActivity, setNewActivity] = useState({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "" });
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
    setViewingAccount(account);
    setViewDialogOpen(true);
  };

  const openEdit = (account: Account) => {
    setViewDialogOpen(false);
    setViewingAccount(null);
    setEditingId(account.accountid ?? null);
    setName(account.name);
    setParentAccountId(account._parentaccountid_value ?? "");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: {
        name: string;
        "parentaccountid@odata.bind"?: string | null;
      } = { name };

      if (parentAccountId) {
        payload["parentaccountid@odata.bind"] = `/accounts(${parentAccountId})`;
      } else if (editingId) {
        payload["parentaccountid@odata.bind"] = null;
      }

      if (editingId) {
        await updateAccount(editingId, payload);
      } else {
        await createAccount(payload);
      }
      setDialogOpen(false);
      setName("");
      setParentAccountId("");
      setEditingId(null);
      loadAccounts();
    } catch (err) {
      console.error("Failed to save account:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAccount(id);
      loadAccounts();
    } catch (err) {
      console.error("Failed to delete account:", err);
    }
  };

  const loadRelatedRecords = useCallback(async (accountId: string) => {
    setLoadingRelated(true);
    try {
      const [contacts, activities, tasks, impacts, ideas, summaries] = await Promise.all([
        getContactsByAccount(accountId),
        getActivitiesByAccount(accountId),
        getActionItemsByAccount(accountId),
        getImpactsByAccount(accountId),
        getIdeasByAccount(accountId),
        getMeetingSummariesByAccount(accountId),
      ]);
      setRelatedContacts(contacts);
      setRelatedActivities(activities);
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
      setRelatedActivities([]);
      setRelatedTasks([]);
      setRelatedImpacts([]);
      setRelatedIdeas([]);
      setRelatedSummaries([]);
    }
  }, [viewingAccount, loadRelatedRecords]);

  // Handlers for adding new related records
  const handleAddContact = async () => {
    if (!newContact.firstname || !newContact.lastname || !viewingAccount?.accountid) return;
    try {
      await createCustomer({
        ...newContact,
        "parentcustomerid_account@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddContactOpen(false);
      setNewContact({ firstname: "", lastname: "", emailaddress1: "", telephone1: "", jobtitle: "" });
      loadRelatedRecords(viewingAccount.accountid);
    } catch (err) {
      console.error("Failed to add contact:", err);
    }
  };

  const handleAddActionItem = async () => {
    if (!newActionItem.tdvsp_name || !viewingAccount?.accountid) return;
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
    } catch (err) {
      console.error("Failed to add action item:", err);
    }
  };

  const handleAddIdea = async () => {
    if (!newIdea.tdvsp_name || !viewingAccount?.accountid) return;
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
    } catch (err) {
      console.error("Failed to add idea:", err);
    }
  };

  const handleAddActivity = async () => {
    if (!newActivity.tdvsp_name || !viewingAccount?.accountid) return;
    try {
      await createActivity({
        tdvsp_name: newActivity.tdvsp_name,
        tdvsp_description: newActivity.tdvsp_description,
        tdvsp_date: newActivity.tdvsp_date || new Date().toISOString().split("T")[0],
        "tdvsp_Customer@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setAddActivityOpen(false);
      setNewActivity({ tdvsp_name: "", tdvsp_description: "", tdvsp_date: "" });
      loadRelatedRecords(viewingAccount.accountid);
    } catch (err) {
      console.error("Failed to add activity:", err);
    }
  };

  const handleAddImpact = async () => {
    if (!newImpact.tdvsp_name || !viewingAccount?.accountid) return;
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
    } catch (err) {
      console.error("Failed to add impact:", err);
    }
  };

  const handleAddSummary = async () => {
    if (!newSummary.tdvsp_name || !viewingAccount?.accountid) return;
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
    } catch (err) {
      console.error("Failed to add meeting summary:", err);
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
            title="Delete"
            onClick={() => item.accountid && handleDelete(item.accountid)}
          />
        </div>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search accounts..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            Add Account
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{editingId ? "Edit Account" : "New Account"}</DialogTitle>
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
                <Button appearance="primary" onClick={handleSave}>
                  Save
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => setViewDialogOpen(d.open)}>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Account Name and Parent Account */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                    <div className={styles.viewField}>
                      <Label>Account Name</Label>
                      <Text block size={500} weight="semibold">
                        {viewingAccount.name}
                      </Text>
                    </div>
                    <div className={styles.viewField}>
                      <Label>Parent Account</Label>
                      <Text block size={400}>
                        {viewingAccount.parentaccountid?.name || "--"}
                      </Text>
                    </div>
                  </div>

                  {loadingRelated ? (
                    <Spinner size="small" label="Loading related records..." />
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
                      {/* Column 1: Contacts, Tasks, Ideas */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* Contacts */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
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

                        {/* Action Items */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <Subtitle1>Action Items</Subtitle1>
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
                                  <Caption1 style={{ marginLeft: 8, color: tokens.colorNeutralForeground3 }}>
                                    {t.tdvsp_date && formatDate(t.tdvsp_date)}
                                    {t.tdvsp_taskstatus != null && ` · ${taskStatusLabels[t.tdvsp_taskstatus as TaskStatus] ?? ""}`}
                                    {t.tdvsp_priority != null && ` · ${taskPriorityLabels[t.tdvsp_priority as TaskPriority] ?? ""}`}
                                    {t.tdvsp_tasktype != null && ` · ${taskTypeLabels[t.tdvsp_tasktype as TaskType] ?? ""}`}
                                  </Caption1>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Ideas */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
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
                                  {idea.tdvsp_category && (
                                    <Caption1 style={{ marginLeft: 8 }}>{ideaCategoryLabels[idea.tdvsp_category]}</Caption1>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 2: High-Value Activities, Impacts */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        {/* High-Value Activities */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <Subtitle1>High-Value Activities</Subtitle1>
                            <span className={styles.badge}>{relatedActivities.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddActivityOpen(true)}>Add</Button>
                          </div>
                          {relatedActivities.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No activities</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedActivities.map((a) => (
                                <div key={a.tdvsp_hvaid} className={styles.relatedItem}>
                                  <Text weight="semibold">{a.tdvsp_name}</Text>
                                  {a.tdvsp_date && <Caption1 style={{ marginLeft: 8 }}>{formatDate(a.tdvsp_date)}</Caption1>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Impacts */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
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
                                  {i.tdvsp_date && <Caption1 style={{ marginLeft: 8 }}>{formatDate(i.tdvsp_date)}</Caption1>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Meeting Summaries */}
                        <div className={styles.relatedSection} style={{ marginTop: 0 }}>
                          <div className={styles.relatedHeader}>
                            <Subtitle1>Meeting Summaries</Subtitle1>
                            <span className={styles.badge}>{relatedSummaries.length}</span>
                            <Button appearance="subtle" size="small" icon={<Add16Regular />} onClick={() => setAddSummaryOpen(true)}>Add</Button>
                          </div>
                          {relatedSummaries.length === 0 ? (
                            <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No meeting summaries</Caption1>
                          ) : (
                            <div className={styles.relatedList}>
                              {relatedSummaries.map((s) => (
                                <div key={s.tdvsp_meetingsummaryid} className={styles.relatedItem}>
                                  <Text weight="semibold">{s.tdvsp_name}</Text>
                                  {s.tdvsp_date && <Caption1 style={{ marginLeft: 8 }}>{formatDate(s.tdvsp_date)}</Caption1>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Column 3: Notes */}
                      <div style={{ display: "flex", flexDirection: "column" }}>
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
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => viewingAccount && openEdit(viewingAccount)}
              >
                Edit
              </Button>
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
              <Button appearance="primary" onClick={handleAddContact} disabled={!newContact.firstname || !newContact.lastname}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Action Item Dialog */}
      <Dialog open={addActionItemOpen} onOpenChange={(_, d) => setAddActionItemOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add Action Item to {viewingAccount?.name}</DialogTitle>
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
                      {Object.entries(taskPriorityLabels).map(([value, label]) => (
                        <Option key={value} value={value} text={label}>{label}</Option>
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
              <Button appearance="primary" onClick={handleAddActionItem} disabled={!newActionItem.tdvsp_name}>Save</Button>
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
              <Button appearance="primary" onClick={handleAddIdea} disabled={!newIdea.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add High-Value Activity Dialog */}
      <Dialog open={addActivityOpen} onOpenChange={(_, d) => setAddActivityOpen(d.open)}>
        <DialogSurface>
          <DialogBody>
            <DialogTitle>Add High-Value Activity to {viewingAccount?.name}</DialogTitle>
            <DialogContent>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div className={styles.formField}>
                  <Label required>Name</Label>
                  <Input value={newActivity.tdvsp_name} onChange={(_, d) => setNewActivity({ ...newActivity, tdvsp_name: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Date</Label>
                  <Input type="date" value={newActivity.tdvsp_date} onChange={(_, d) => setNewActivity({ ...newActivity, tdvsp_date: d.value })} />
                </div>
                <div className={styles.formField}>
                  <Label>Description</Label>
                  <Textarea value={newActivity.tdvsp_description} onChange={(_, d) => setNewActivity({ ...newActivity, tdvsp_description: d.value })} rows={3} />
                </div>
              </div>
            </DialogContent>
            <DialogActions>
              <Button appearance="secondary" onClick={() => setAddActivityOpen(false)}>Cancel</Button>
              <Button appearance="primary" onClick={handleAddActivity} disabled={!newActivity.tdvsp_name}>Save</Button>
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
              <Button appearance="primary" onClick={handleAddImpact} disabled={!newImpact.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      {/* Add Meeting Summary Dialog */}
      <Dialog open={addSummaryOpen} onOpenChange={(_, d) => setAddSummaryOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "600px", width: "600px" }}>
          <DialogBody>
            <DialogTitle>Add Meeting Summary to {viewingAccount?.name}</DialogTitle>
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
              <Button appearance="primary" onClick={handleAddSummary} disabled={!newSummary.tdvsp_name}>Save</Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Card className={styles.card}>
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
        ) : (
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
        )}
      </Card>
    </div>
  );
};
