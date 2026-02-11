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
  TaskListSquareLtr24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { ActionItem, Account, TaskStatus, taskStatusLabels } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  getAccounts,
} from "../services/dataverseService";
import { NotesTimeline } from "../components/NotesTimeline";

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
    ...shorthands.padding("0px"),
    ...shorthands.borderRadius("12px"),
    overflow: "hidden",
  },
  taskRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.padding("14px", "20px"),
    ...shorthands.gap("12px"),
    transition: "background-color 0.1s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  taskContent: {
    flexGrow: 1,
    minWidth: 0,
  },
  taskMeta: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    marginTop: "4px",
  },
  metaItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  formField: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
  },
  formFieldFull: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    gridColumn: "1 / -1",
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

interface FormData {
  tdvsp_name: string;
  tdvsp_date: string;
  tdvsp_description: string;
  tdvsp_taskstatus: string;
  customerAccountId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_date: "",
  tdvsp_description: "",
  tdvsp_taskstatus: "",
  customerAccountId: "",
};

export const Tasks: React.FC = () => {
  const styles = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ActionItem | null>(null);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActionItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load action items:", err);
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
    loadItems();
    loadAccounts();
  }, [loadItems, loadAccounts]);

  // Auto-open new dialog if ?new=true
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (item: ActionItem) => {
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const openEdit = (item: ActionItem) => {
    setViewDialogOpen(false);
    setViewingItem(null);
    setEditingId(item.tdvsp_actionitemid ?? null);
    setFormData({
      tdvsp_name: item.tdvsp_name,
      tdvsp_date: item.tdvsp_date ? item.tdvsp_date.split("T")[0] : "",
      tdvsp_description: item.tdvsp_description ?? "",
      tdvsp_taskstatus: item.tdvsp_taskstatus != null ? String(item.tdvsp_taskstatus) : "",
      customerAccountId: item.tdvsp_Customer?.accountid ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const payload: {
        tdvsp_name: string;
        tdvsp_date: string;
        tdvsp_description?: string;
        tdvsp_taskstatus?: number;
        "tdvsp_Customer@odata.bind"?: string;
      } = {
        tdvsp_name: formData.tdvsp_name,
        tdvsp_date: formData.tdvsp_date,
        tdvsp_description: formData.tdvsp_description || undefined,
        tdvsp_taskstatus: formData.tdvsp_taskstatus ? Number(formData.tdvsp_taskstatus) : undefined,
      };
      if (formData.customerAccountId) {
        payload["tdvsp_Customer@odata.bind"] = `/accounts(${formData.customerAccountId})`;
      }
      if (editingId) {
        await updateActionItem(editingId, payload);
      } else {
        await createActionItem(payload);
      }
      setDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      loadItems();
    } catch (err) {
      console.error("Failed to save action item:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActionItem(id);
      loadItems();
    } catch (err) {
      console.error("Failed to delete action item:", err);
    }
  };

  const filtered = items.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.tdvsp_name?.toLowerCase().includes(q) ||
      t.tdvsp_Customer?.name?.toLowerCase().includes(q)
    );
  });

  const gridColumns: TableColumnDefinition<ActionItem>[] = [
    createTableColumn({
      columnId: "date",
      compare: (a, b) => (a.tdvsp_date ?? "").localeCompare(b.tdvsp_date ?? ""),
      renderHeaderCell: () => "Date",
      renderCell: (item) => (
        <Text>{item.tdvsp_date ? formatDate(item.tdvsp_date) : "--"}</Text>
      ),
    }),
    createTableColumn({
      columnId: "name",
      compare: (a, b) => (a.tdvsp_name ?? "").localeCompare(b.tdvsp_name ?? ""),
      renderHeaderCell: () => "Name",
      renderCell: (item) => (
        <Text
          weight="semibold"
          className={styles.nameLink}
          onClick={() => openView(item)}
        >
          {item.tdvsp_name}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "taskStatus",
      compare: (a, b) => (a.tdvsp_taskstatus ?? 0) - (b.tdvsp_taskstatus ?? 0),
      renderHeaderCell: () => "Task Status",
      renderCell: (item) => (
        <Text>
          {item.tdvsp_taskstatus != null
            ? taskStatusLabels[item.tdvsp_taskstatus as TaskStatus] ?? "--"
            : "--"}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "customer",
      compare: (a, b) =>
        (a.tdvsp_Customer?.name ?? "").localeCompare(b.tdvsp_Customer?.name ?? ""),
      renderHeaderCell: () => "Customer",
      renderCell: (item) => (
        <Text>{item.tdvsp_Customer?.name ?? "--"}</Text>
      ),
    }),
    createTableColumn({
      columnId: "description",
      renderHeaderCell: () => "Description",
      renderCell: (item) => (
        <Text
          truncate
          wrap={false}
          style={{ maxWidth: 200, display: "block", overflow: "hidden", textOverflow: "ellipsis" }}
          title={item.tdvsp_description ?? ""}
        >
          {item.tdvsp_description || "--"}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "createdon",
      compare: (a, b) => (a.createdon ?? "").localeCompare(b.createdon ?? ""),
      renderHeaderCell: () => "Created On",
      renderCell: (item) => (
        <Text>{item.createdon ? formatDate(item.createdon) : "--"}</Text>
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
            onClick={() =>
              item.tdvsp_actionitemid &&
              handleDelete(item.tdvsp_actionitemid)
            }
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
          placeholder="Search action items..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Action Item
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{editingId ? "Edit Action Item" : "New Action Item"}</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="What needs to be done?"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.tdvsp_description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_description: d.value })
                      }
                      placeholder="Add details about this action item..."
                      rows={4}
                      resize="vertical"
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label required>Date</Label>
                    <Input
                      type="date"
                      value={formData.tdvsp_date}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_date: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Customer (Account)</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={
                        accounts.find(
                          (a) => a.accountid === formData.customerAccountId
                        )?.name ?? ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          customerAccountId: d.optionValue ?? "",
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
                  <div className={styles.formField}>
                    <Label>Task Status</Label>
                    <Dropdown
                      placeholder="Select status"
                      value={
                        formData.tdvsp_taskstatus
                          ? taskStatusLabels[Number(formData.tdvsp_taskstatus) as TaskStatus] ?? ""
                          : ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          tdvsp_taskstatus: d.optionValue ?? "",
                        })
                      }
                    >
                      {(Object.entries(taskStatusLabels) as [string, string][]).map(
                        ([value, label]) => (
                          <Option key={value} value={value}>
                            {label}
                          </Option>
                        )
                      )}
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

      <Card className={styles.card}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner label="Loading action items..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <TaskListSquareLtr24Filled
              style={{ fontSize: 48, color: "#107c10", marginBottom: 16 }}
            />
            <Subtitle1>No action items found</Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              Create your first action item to start tracking.
            </Caption1>
          </div>
        ) : (
          <DataGrid
            items={filtered}
            columns={gridColumns}
            getRowId={(item) => item.tdvsp_actionitemid ?? item.tdvsp_name}
            sortable
          >
            <DataGridHeader>
              <DataGridRow>
                {({ renderHeaderCell }) => (
                  <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<ActionItem>>
              {({ item, rowId }) => (
                <DataGridRow<ActionItem> key={rowId}>
                  {({ renderCell }) => (
                    <DataGridCell>{renderCell(item)}</DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => setViewDialogOpen(d.open)}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
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
              Action Item Details
            </DialogTitle>
            <DialogContent>
              {viewingItem && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      <Text block size={400} weight="semibold">
                        {viewingItem.tdvsp_name}
                      </Text>
                    </div>
                    {viewingItem.tdvsp_description && (
                      <div className={styles.viewField}>
                        <Label>Description</Label>
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>
                          {viewingItem.tdvsp_description}
                        </Text>
                      </div>
                    )}
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}>
                        <Label>Date</Label>
                        <Text block size={400}>
                          {viewingItem.tdvsp_date ? formatDate(viewingItem.tdvsp_date) : "--"}
                        </Text>
                      </div>
                      <div className={styles.viewField}>
                        <Label>Task Status</Label>
                        <Text block size={400}>
                          {viewingItem.tdvsp_taskstatus != null
                            ? taskStatusLabels[viewingItem.tdvsp_taskstatus as TaskStatus] ?? "--"
                            : "--"}
                        </Text>
                      </div>
                      <div className={styles.viewField}>
                        <Label>Customer</Label>
                        <Text block size={400}>
                          {viewingItem.tdvsp_Customer?.name || "--"}
                        </Text>
                      </div>
                      <div className={styles.viewField}>
                        <Label>Created On</Label>
                        <Text block size={400}>
                          {viewingItem.createdon ? formatDate(viewingItem.createdon) : "--"}
                        </Text>
                      </div>
                    </div>
                  </div>
                  <div className={styles.viewNotes}>
                    <NotesTimeline
                      entityId={viewingItem.tdvsp_actionitemid!}
                      entityName={viewingItem.tdvsp_name}
                      entityType="actionitem"
                      odataBindKey="objectid_tdvsp_actionitem@odata.bind"
                      entitySetPath="/tdvsp_actionitems"
                    />
                  </div>
                </div>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => viewingItem && openEdit(viewingItem)}
              >
                Edit
              </Button>
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
