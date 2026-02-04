import React, { useEffect, useState, useCallback } from "react";
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
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { Account, Annotation, Customer, HighValueActivity, ActionItem, Impact, Idea, ideaCategoryLabels } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountAnnotations,
  createAnnotation,
  getContactsByAccount,
  getActivitiesByAccount,
  getActionItemsByAccount,
  getImpactsByAccount,
  getIdeasByAccount,
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
    maxHeight: "200px",
    overflowY: "auto",
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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingAccount, setViewingAccount] = useState<Account | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [relatedContacts, setRelatedContacts] = useState<Customer[]>([]);
  const [relatedActivities, setRelatedActivities] = useState<HighValueActivity[]>([]);
  const [relatedTasks, setRelatedTasks] = useState<ActionItem[]>([]);
  const [relatedImpacts, setRelatedImpacts] = useState<Impact[]>([]);
  const [relatedIdeas, setRelatedIdeas] = useState<Idea[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

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

  const openNew = () => {
    setEditingId(null);
    setName("");
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
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateAccount(editingId, { name });
      } else {
        await createAccount({ name });
      }
      setDialogOpen(false);
      setName("");
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

  const loadAnnotations = useCallback(async (accountId: string) => {
    setLoadingNotes(true);
    try {
      const data = await getAccountAnnotations(accountId);
      setAnnotations(data);
    } catch (err) {
      console.error("Failed to load notes:", err);
    } finally {
      setLoadingNotes(false);
    }
  }, []);

  const loadRelatedRecords = useCallback(async (accountId: string) => {
    setLoadingRelated(true);
    try {
      const [contacts, activities, tasks, impacts, ideas] = await Promise.all([
        getContactsByAccount(accountId),
        getActivitiesByAccount(accountId),
        getActionItemsByAccount(accountId),
        getImpactsByAccount(accountId),
        getIdeasByAccount(accountId),
      ]);
      setRelatedContacts(contacts);
      setRelatedActivities(activities);
      setRelatedTasks(tasks);
      setRelatedImpacts(impacts);
      setRelatedIdeas(ideas);
    } catch (err) {
      console.error("Failed to load related records:", err);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    if (viewingAccount?.accountid) {
      loadAnnotations(viewingAccount.accountid);
      loadRelatedRecords(viewingAccount.accountid);
    } else {
      setAnnotations([]);
      setRelatedContacts([]);
      setRelatedActivities([]);
      setRelatedTasks([]);
      setRelatedImpacts([]);
      setRelatedIdeas([]);
    }
  }, [viewingAccount, loadAnnotations, loadRelatedRecords]);

  const handleAddNote = async () => {
    if (!newNote.trim() || !viewingAccount?.accountid) return;
    try {
      await createAnnotation({
        notetext: newNote,
        "objectid_account@odata.bind": `/accounts(${viewingAccount.accountid})`,
      });
      setNewNote("");
      loadAnnotations(viewingAccount.accountid);
    } catch (err) {
      console.error("Failed to add note:", err);
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
        <DialogSurface>
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
                <div style={{ display: "flex", flexDirection: "column", gap: "24px", minWidth: "600px" }}>
                  {/* Account Name */}
                  <div className={styles.viewField}>
                    <Label>Account Name</Label>
                    <Text block size={500} weight="semibold">
                      {viewingAccount.name}
                    </Text>
                  </div>

                  {loadingRelated ? (
                    <Spinner size="small" label="Loading related records..." />
                  ) : (
                    <>
                      {/* Contacts */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>Contacts</Subtitle1>
                          <span className={styles.badge}>{relatedContacts.length}</span>
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

                      {/* High-Value Activities */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>High-Value Activities</Subtitle1>
                          <span className={styles.badge}>{relatedActivities.length}</span>
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

                      {/* Tasks & Action Items */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>Tasks & Action Items</Subtitle1>
                          <span className={styles.badge}>{relatedTasks.length}</span>
                        </div>
                        {relatedTasks.length === 0 ? (
                          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No tasks</Caption1>
                        ) : (
                          <div className={styles.relatedList}>
                            {relatedTasks.map((t) => (
                              <div key={t.tdvsp_actionitemid} className={styles.relatedItem}>
                                <Text weight="semibold">{t.tdvsp_name}</Text>
                                {t.tdvsp_date && <Caption1 style={{ marginLeft: 8 }}>{formatDate(t.tdvsp_date)}</Caption1>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Impacts */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>Impacts</Subtitle1>
                          <span className={styles.badge}>{relatedImpacts.length}</span>
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

                      {/* Ideas */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>Ideas</Subtitle1>
                          <span className={styles.badge}>{relatedIdeas.length}</span>
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

                      {/* Notes */}
                      <div className={styles.relatedSection}>
                        <div className={styles.relatedHeader}>
                          <Subtitle1>Notes</Subtitle1>
                          <span className={styles.badge}>{annotations.length}</span>
                        </div>
                        {loadingNotes ? (
                          <Spinner size="small" />
                        ) : annotations.length === 0 ? (
                          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>No notes yet</Caption1>
                        ) : (
                          <div className={styles.relatedList}>
                            {annotations.map((note) => (
                              <div key={note.annotationid} className={styles.relatedItem}>
                                <div className={styles.noteDate}>
                                  {note.createdon ? formatDate(note.createdon) : ""}
                                </div>
                                <Text size={300}>{note.notetext}</Text>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className={styles.noteInput}>
                          <Textarea
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(_, d) => setNewNote(d.value)}
                            rows={2}
                          />
                          <Button
                            appearance="primary"
                            size="small"
                            style={{ marginTop: 8 }}
                            onClick={handleAddNote}
                            disabled={!newNote.trim()}
                          >
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </>
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
