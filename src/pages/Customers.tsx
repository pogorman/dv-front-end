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
  Body1,
  Caption1,
  Divider,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
  Spinner,
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
} from "@fluentui/react-icons";
import { Customer } from "../types";
import {
  getCustomers,
  createCustomer,
  deleteCustomer,
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
});

const emptyCustomer: Omit<Customer, "contactid"> = {
  firstname: "",
  lastname: "",
  emailaddress1: "",
  telephone1: "",
  jobtitle: "",
};

export const Customers: React.FC = () => {
  const styles = useStyles();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyCustomer);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSave = async () => {
    try {
      await createCustomer(formData);
      setDialogOpen(false);
      setFormData(emptyCustomer);
      loadCustomers();
    } catch (err) {
      console.error("Failed to save customer:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id);
      loadCustomers();
    } catch (err) {
      console.error("Failed to delete customer:", err);
    }
  };

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    return (
      c.firstname?.toLowerCase().includes(q) ||
      c.lastname?.toLowerCase().includes(q) ||
      c.emailaddress1?.toLowerCase().includes(q) ||
      c.jobtitle?.toLowerCase().includes(q)
    );
  });

  const columns: TableColumnDefinition<Customer>[] = [
    createTableColumn({
      columnId: "name",
      compare: (a, b) =>
        (a.lastname ?? "").localeCompare(b.lastname ?? ""),
      renderHeaderCell: () => "Name",
      renderCell: (item) => (
        <Text weight="semibold">
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
      columnId: "actions",
      renderHeaderCell: () => "Actions",
      renderCell: (item) => (
        <div style={{ display: "flex", gap: 4 }}>
          <Button
            appearance="subtle"
            icon={<Edit24Regular />}
            size="small"
            title="Edit"
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
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Customer</DialogTitle>
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
                </div>
              </DialogContent>
              <DialogActions>
                <DialogTrigger disableButtonEnhancement>
                  <Button appearance="secondary">Cancel</Button>
                </DialogTrigger>
                <Button appearance="primary" onClick={handleSave}>
                  Save
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      <Card className={styles.card}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
            <Spinner label="Loading customers..." />
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className={styles.emptyState}>
            <Subtitle1>No customers found</Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              {customers.length === 0
                ? "Add your first customer to get started, or connect to Dataverse."
                : "Try a different search term."}
            </Caption1>
          </div>
        ) : (
          <DataGrid
            items={filteredCustomers}
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
