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
import { Customer, Account } from "../types";
import {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAccounts,
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
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingContact, setViewingContact] = useState<Customer | null>(null);

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

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (contact: Customer) => {
    setViewingContact(contact);
    setViewDialogOpen(true);
  };

  const openEdit = (contact: Customer) => {
    setViewDialogOpen(false);
    setViewingContact(null);
    setEditingId(contact.contactid ?? null);
    setFormData({
      firstname: contact.firstname,
      lastname: contact.lastname,
      emailaddress1: contact.emailaddress1,
      telephone1: contact.telephone1,
      jobtitle: contact.jobtitle,
      accountId: contact.parentcustomerid_account?.accountid ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
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
      if (editingId) {
        await updateCustomer(editingId, payload);
      } else {
        await createCustomer(payload);
      }
      setDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      loadContacts();
    } catch (err) {
      console.error("Failed to save contact:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      loadContacts();
    } catch (err) {
      console.error("Failed to delete contact:", err);
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
            title="Delete"
            onClick={() => item.contactid && handleDelete(item.contactid)}
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
              <DialogTitle>{editingId ? "Edit Contact" : "New Contact"}</DialogTitle>
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
              Contact Details
            </DialogTitle>
            <DialogContent>
              {viewingContact && (
                <div className={styles.viewGrid}>
                  <div className={styles.viewField}>
                    <Label>First Name</Label>
                    <Text block size={400} weight="semibold">
                      {viewingContact.firstname || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Last Name</Label>
                    <Text block size={400} weight="semibold">
                      {viewingContact.lastname || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Email</Label>
                    <Text block size={400}>
                      {viewingContact.emailaddress1 || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Phone</Label>
                    <Text block size={400}>
                      {viewingContact.telephone1 || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Job Title</Label>
                    <Text block size={400}>
                      {viewingContact.jobtitle || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Account</Label>
                    <Text block size={400}>
                      {viewingContact.parentcustomerid_account?.name || "--"}
                    </Text>
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => viewingContact && openEdit(viewingContact)}
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
