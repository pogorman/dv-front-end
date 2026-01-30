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
  Delete24Regular,
} from "@fluentui/react-icons";
import { Account } from "../types";
import {
  getAccounts,
  createAccount,
  deleteAccount,
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
});

export const Accounts: React.FC = () => {
  const styles = useStyles();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");

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

  const handleSave = async () => {
    try {
      await createAccount({ name });
      setDialogOpen(false);
      setName("");
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

  const filteredAccounts = accounts.filter((a) =>
    a.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: TableColumnDefinition<Account>[] = [
    createTableColumn({
      columnId: "name",
      compare: (a, b) => (a.name ?? "").localeCompare(b.name ?? ""),
      renderHeaderCell: () => "Account Name",
      renderCell: (item) => (
        <Text weight="semibold">{item.name}</Text>
      ),
    }),
    createTableColumn({
      columnId: "actions",
      renderHeaderCell: () => "Actions",
      renderCell: (item) => (
        <Button
          appearance="subtle"
          icon={<Delete24Regular />}
          size="small"
          title="Delete"
          onClick={() => item.accountid && handleDelete(item.accountid)}
        />
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
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>
              Add Account
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Account</DialogTitle>
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
