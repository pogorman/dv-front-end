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
import { Account, Annotation } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getAccounts,
  createAccount,
  updateAccount,
  deleteAccount,
  getAccountAnnotations,
  createAnnotation,
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

  useEffect(() => {
    if (viewingAccount?.accountid) {
      loadAnnotations(viewingAccount.accountid);
    } else {
      setAnnotations([]);
    }
  }, [viewingAccount, loadAnnotations]);

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
                <div className={styles.viewDialogContent}>
                  {/* Left Panel - Account Details */}
                  <div className={styles.detailsPanel}>
                    <div className={styles.viewField}>
                      <Label>Account Name</Label>
                      <Text block size={400} weight="semibold">
                        {viewingAccount.name}
                      </Text>
                    </div>
                  </div>

                  {/* Right Panel - Timeline */}
                  <div className={styles.timelinePanel}>
                    <div className={styles.timelineHeader}>
                      <Subtitle1>Notes</Subtitle1>
                    </div>

                    <div className={styles.timelineList}>
                      {loadingNotes ? (
                        <Spinner size="small" />
                      ) : annotations.length === 0 ? (
                        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
                          No notes yet
                        </Caption1>
                      ) : (
                        annotations.map((note) => (
                          <div key={note.annotationid} className={styles.noteItem}>
                            <div className={styles.noteDate}>
                              {note.createdon ? formatDate(note.createdon) : ""}
                            </div>
                            <Text size={300}>{note.notetext}</Text>
                          </div>
                        ))
                      )}
                    </div>

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
