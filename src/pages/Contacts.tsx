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
  Dropdown,
  Option,
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
import { Customer, Account, Idea, ideaCategoryLabels } from "../types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deactivateContact,
  getAccounts,
  getIdeasByContact,
} from "../services/dataverseService";
import { useNotification } from "../context/NotificationContext";

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
  card: {
    ...shorthands.padding("16px"),
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: "none",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
    "@media (max-width: 600px)": {
      gridTemplateColumns: "1fr",
    },
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
  viewField: {
    marginBottom: "16px",
  },
  viewGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  relatedSection: {
    marginTop: "20px",
    gridColumn: "1 / -1",
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
});

interface FormData {
  firstname: string;
  lastname: string;
  emailaddress1: string;
  telephone1: string;
  jobtitle: string;
  accountId: string;
}

const emptyForm: FormData = {
  firstname: "",
  lastname: "",
  emailaddress1: "",
  telephone1: "",
  jobtitle: "",
  accountId: "",
};

export const Contacts: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState<Customer | null>(null);
  const [relatedIdeas, setRelatedIdeas] = useState<Idea[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadContacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      const data = await getAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Failed to load accounts:", err);
    }
  }, []);

  useEffect(() => {
    loadContacts();
    loadAccounts();
  }, [loadContacts, loadAccounts]);

  // Auto-open new dialog if ?new=true
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const loadRelatedRecords = useCallback(async (contactId: string) => {
    setLoadingRelated(true);
    try {
      const ideas = await getIdeasByContact(contactId);
      setRelatedIdeas(ideas);
    } catch (err) {
      console.error("Failed to load related records:", err);
    } finally {
      setLoadingRelated(false);
    }
  }, []);

  useEffect(() => {
    if (viewingContact?.contactid) {
      loadRelatedRecords(viewingContact.contactid);
    } else {
      setRelatedIdeas([]);
    }
  }, [viewingContact, loadRelatedRecords]);

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (contact: Customer) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingContact(contact);
    setViewDialogOpen(true);
  };

  const openEdit = (contact: Customer) => {
    setViewingContact(contact);
    setViewDialogOpen(true);
    setEditingId(contact.contactid ?? null);
    setFormData({
      firstname: contact.firstname,
      lastname: contact.lastname,
      emailaddress1: contact.emailaddress1,
      telephone1: contact.telephone1,
      jobtitle: contact.jobtitle,
      accountId: contact.parentcustomerid_account?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildContactPayload = () => {
    const payload: {
      firstname: string;
      lastname: string;
      emailaddress1: string;
      telephone1: string;
      jobtitle: string;
      "parentcustomerid_account@odata.bind"?: string;
    } = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      emailaddress1: formData.emailaddress1,
      telephone1: formData.telephone1,
      jobtitle: formData.jobtitle,
    };
    if (formData.accountId) {
      payload["parentcustomerid_account@odata.bind"] = `/accounts(${formData.accountId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createCustomer(buildContactPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadContacts();
      notify("Contact created");
    } catch (err) {
      console.error("Failed to save contact:", err);
      notify("Failed to save contact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateCustomer(editingId, buildContactPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedContacts = await getCustomers();
      setContacts(updatedContacts);
      const updated = updatedContacts.find((c) => c.contactid === viewingContact?.contactid);
      if (updated) setViewingContact(updated);
      notify("Contact updated");
    } catch (err) {
      console.error("Failed to save contact:", err);
      notify("Failed to save contact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateContact(id);
      loadContacts();
      notify("Contact deactivated");
    } catch (err) {
      console.error("Failed to deactivate contact:", err);
      notify("Failed to deactivate contact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filteredContacts = contacts.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstname?.toLowerCase().includes(q) ||
      c.lastname?.toLowerCase().includes(q) ||
      c.emailaddress1?.toLowerCase().includes(q) ||
      c.jobtitle?.toLowerCase().includes(q) ||
      c.parentcustomerid_account?.name?.toLowerCase().includes(q)
    );
  });

  const columns: TableColumnDefinition<Customer>[] = [
    createTableColumn({
      columnId: "name",
      compare: (a, b) =>
        (a.lastname ?? "").localeCompare(b.lastname ?? ""),
      renderHeaderCell: () => "Name",
      renderCell: (item) => (
        <Text
          weight="semibold"
          className={styles.nameLink}
          onClick={() => openView(item)}
        >
          {item.firstname} {item.lastname}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "email",
      renderHeaderCell: () => "Email",
      renderCell: (item) => item.emailaddress1 ?? "--",
    }),
    createTableColumn({
      columnId: "phone",
      renderHeaderCell: () => "Phone",
      renderCell: (item) => item.telephone1 ?? "--",
    }),
    createTableColumn({
      columnId: "jobtitle",
      renderHeaderCell: () => "Job Title",
      renderCell: (item) => item.jobtitle ?? "--",
    }),
    createTableColumn({
      columnId: "account",
      renderHeaderCell: () => "Account",
      renderCell: (item) => item.parentcustomerid_account?.name ?? "--",
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
            onClick={() => item.contactid && handleDeactivate(item.contactid)}
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
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            Add Contact
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Contact</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <Label htmlFor="firstname" required>
                      First Name
                    </Label>
                    <Input
                      id="firstname"
                      value={formData.firstname}
                      onChange={(_, d) =>
                        setFormData({ ...formData, firstname: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="lastname" required>
                      Last Name
                    </Label>
                    <Input
                      id="lastname"
                      value={formData.lastname}
                      onChange={(_, d) =>
                        setFormData({ ...formData, lastname: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.emailaddress1}
                      onChange={(_, d) =>
                        setFormData({ ...formData, emailaddress1: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.telephone1}
                      onChange={(_, d) =>
                        setFormData({ ...formData, telephone1: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label htmlFor="jobtitle">Job Title</Label>
                    <Input
                      id="jobtitle"
                      value={formData.jobtitle}
                      onChange={(_, d) =>
                        setFormData({ ...formData, jobtitle: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={
                        accounts.find((a) => a.accountid === formData.accountId)
                          ?.name ?? ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          accountId: d.optionValue ?? "",
                        })
                      }
                    >
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!}>
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
                <Button appearance="primary" onClick={handleSaveNew} disabled={saving || !formData.firstname.trim() || !formData.lastname.trim()}>
                  {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
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
              Contact Details
            </DialogTitle>
            <DialogContent>
              {viewingContact && (
                <div className={styles.viewGrid}>
                  <div className={styles.viewField}>
                    <Label>First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.firstname}
                        onChange={(_, d) => setFormData({ ...formData, firstname: d.value })}
                      />
                    ) : (
                      <Text block size={400} weight="semibold">
                        {viewingContact.firstname || "--"}
                      </Text>
                    )}
                  </div>
                  <div className={styles.viewField}>
                    <Label>Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.lastname}
                        onChange={(_, d) => setFormData({ ...formData, lastname: d.value })}
                      />
                    ) : (
                      <Text block size={400} weight="semibold">
                        {viewingContact.lastname || "--"}
                      </Text>
                    )}
                  </div>
                  <div className={styles.viewField}>
                    <Label>Email</Label>
                    {isEditing ? (
                      <Input
                        type="email"
                        value={formData.emailaddress1}
                        onChange={(_, d) => setFormData({ ...formData, emailaddress1: d.value })}
                      />
                    ) : (
                      <Text block size={400}>
                        {viewingContact.emailaddress1 || "--"}
                      </Text>
                    )}
                  </div>
                  <div className={styles.viewField}>
                    <Label>Phone</Label>
                    {isEditing ? (
                      <Input
                        type="tel"
                        value={formData.telephone1}
                        onChange={(_, d) => setFormData({ ...formData, telephone1: d.value })}
                      />
                    ) : (
                      <Text block size={400}>
                        {viewingContact.telephone1 || "--"}
                      </Text>
                    )}
                  </div>
                  <div className={styles.viewField}>
                    <Label>Job Title</Label>
                    {isEditing ? (
                      <Input
                        value={formData.jobtitle}
                        onChange={(_, d) => setFormData({ ...formData, jobtitle: d.value })}
                      />
                    ) : (
                      <Text block size={400}>
                        {viewingContact.jobtitle || "--"}
                      </Text>
                    )}
                  </div>
                  <div className={styles.viewField}>
                    <Label>Account</Label>
                    {isEditing ? (
                      <Dropdown
                        placeholder="Select account"
                        value={accounts.find((a) => a.accountid === formData.accountId)?.name ?? ""}
                        onOptionSelect={(_, d) => setFormData({ ...formData, accountId: d.optionValue ?? "" })}
                      >
                        {accounts.map((a) => (
                          <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                        ))}
                      </Dropdown>
                    ) : (
                      <Text block size={400}>
                        {viewingContact.parentcustomerid_account?.name || "--"}
                      </Text>
                    )}
                  </div>

                  {/* Related Ideas */}
                  <div className={styles.relatedSection}>
                    <div className={styles.relatedHeader}>
                      <Subtitle1>Ideas</Subtitle1>
                      <span className={styles.badge}>{relatedIdeas.length}</span>
                    </div>
                    {loadingRelated ? (
                      <Spinner size="small" />
                    ) : relatedIdeas.length === 0 ? (
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
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving || !formData.firstname.trim() || !formData.lastname.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingContact && openEdit(viewingContact)}
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>

      <Card className={styles.card}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Spinner label="Loading contacts..." />
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className={styles.emptyState}>
            <Subtitle1>No contacts found</Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              {contacts.length === 0
                ? "Add your first contact to get started."
                : "Try a different search term."}
            </Caption1>
          </div>
        ) : (
          <DataGrid
            items={filteredContacts}
            columns={columns}
            getRowId={(item) => item.contactid ?? item.emailaddress1}
            sortable
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<Customer>>
              {({ item, rowId }) => (
                <DataGridRow<Customer> key={rowId}>
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
