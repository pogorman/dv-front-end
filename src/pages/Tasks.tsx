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
  CheckboxChecked24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { ActionItem, Account, TaskStatus, taskStatusLabels, TaskPriority, taskPriorityLabels, taskPriorityOrder, TaskType, taskTypeLabels } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getActionItems,
  createActionItem,
  updateActionItem,
  deactivateActionItem,
  getAccounts,
} from "../services/dataverseService";
import { NotesTimeline } from "../components/NotesTimeline";
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
    ...shorthands.padding("0px"),
    ...shorthands.borderRadius("8px"),
    overflow: "hidden",
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeft: "3px solid #f87171",
    boxShadow: "none",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
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

// Short labels for grid display
const statusShortLabels: Record<number, string> = {
  468510000: "Pondering",
  468510001: "In Progress",
  468510002: "Pending Comm.",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

const priorityShortLabels: Record<number, string> = {
  468510000: "Low",
  468510001: "Medium",
  468510002: "Top Priority",
  468510003: "High",
};

// Color maps for badges
const statusColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510002: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510003: { bg: "rgba(234, 179, 8, 0.15)", text: "#eab308" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
};

const priorityColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(156, 163, 175, 0.15)", text: "#9ca3af" },
  468510001: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510002: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171" },
  468510003: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
};

const typeColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510001: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171" },
};

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

const isOverdue = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const columnSizes: Record<string, React.CSSProperties> = {
  date: { flex: "0 0 95px", minWidth: 95 },
  name: { flex: "3 1 200px", minWidth: 200 },
  taskStatus: { flex: "0 0 150px", minWidth: 150 },
  taskPriority: { flex: "0 0 115px", minWidth: 115 },
  taskType: { flex: "0 0 85px", minWidth: 85 },
  customer: { flex: "1.5 1 120px", minWidth: 120 },
  actions: { flex: "0 0 72px", minWidth: 72 },
};

interface FormData {
  tdvsp_name: string;
  tdvsp_date: string;
  tdvsp_description: string;
  tdvsp_taskstatus: string;
  tdvsp_priority: string;
  tdvsp_tasktype: string;
  customerAccountId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_date: "",
  tdvsp_description: "",
  tdvsp_taskstatus: "",
  tdvsp_priority: "",
  tdvsp_tasktype: "",
  customerAccountId: "",
};

export const Tasks: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<ActionItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | "work" | "personal">("work");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ActionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActionItems();
      setItems(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
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

  // Auto-open new dialog if ?new=true, or view dialog if ?view=<id>
  useEffect(() => {
    if (searchParams.get("new") === "true") {
      setDialogOpen(true);
      setSearchParams({}, { replace: true });
    }
    const viewId = searchParams.get("view");
    if (viewId && items.length > 0) {
      const item = items.find((t) => t.tdvsp_actionitemid === viewId);
      if (item) {
        setViewingItem(item);
        setViewDialogOpen(true);
        setSearchParams({}, { replace: true });
      }
    }
  }, [searchParams, setSearchParams, items]);

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openView = (item: ActionItem) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingItem(item);
    setViewDialogOpen(true);
  };

  const openEdit = (item: ActionItem) => {
    setViewingItem(item);
    setViewDialogOpen(true);
    setEditingId(item.tdvsp_actionitemid ?? null);
    setFormData({
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

  const buildTaskPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_date: string;
      tdvsp_description?: string;
      tdvsp_taskstatus?: number;
      tdvsp_priority?: number;
      tdvsp_tasktype?: number;
      "tdvsp_Customer@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name,
      tdvsp_date: formData.tdvsp_date,
      tdvsp_description: formData.tdvsp_description || undefined,
      tdvsp_taskstatus: formData.tdvsp_taskstatus ? Number(formData.tdvsp_taskstatus) : undefined,
      tdvsp_priority: formData.tdvsp_priority ? Number(formData.tdvsp_priority) : undefined,
      tdvsp_tasktype: formData.tdvsp_tasktype ? Number(formData.tdvsp_tasktype) : undefined,
    };
    if (formData.customerAccountId) {
      payload["tdvsp_Customer@odata.bind"] = `/accounts(${formData.customerAccountId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createActionItem(buildTaskPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadItems();
      notify("Task created");
    } catch (err) {
      console.error("Failed to save task:", err);
      notify("Failed to save task", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateActionItem(editingId, buildTaskPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedItems = await getActionItems();
      setItems(updatedItems);
      const updated = updatedItems.find((t) => t.tdvsp_actionitemid === viewingItem?.tdvsp_actionitemid);
      if (updated) setViewingItem(updated);
      notify("Task updated");
    } catch (err) {
      console.error("Failed to save task:", err);
      notify("Failed to save task", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateActionItem(id);
      loadItems();
      notify("Task deactivated");
    } catch (err) {
      console.error("Failed to deactivate task:", err);
      notify("Failed to deactivate task", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = items.filter((t) => {
    if (typeFilter === "work" && t.tdvsp_tasktype !== (468510001 as TaskType)) return false;
    if (typeFilter === "personal" && t.tdvsp_tasktype !== (468510000 as TaskType)) return false;
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
      renderCell: (item) => {
        const overdue = item.tdvsp_date ? isOverdue(item.tdvsp_date) : false;
        return (
          <Text style={overdue ? { color: "#f87171", fontWeight: 600 } : undefined}>
            {item.tdvsp_date ? formatDate(item.tdvsp_date) : "--"}
          </Text>
        );
      },
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
          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={item.tdvsp_name}
        >
          {item.tdvsp_name}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "taskStatus",
      compare: (a, b) => (a.tdvsp_taskstatus ?? 0) - (b.tdvsp_taskstatus ?? 0),
      renderHeaderCell: () => "Status",
      renderCell: (item) => {
        if (item.tdvsp_taskstatus == null) return <Text>--</Text>;
        const label = statusShortLabels[item.tdvsp_taskstatus] ?? "--";
        const colors = statusColors[item.tdvsp_taskstatus];
        return colors ? renderBadge(label, colors) : <Text>{label}</Text>;
      },
    }),
    createTableColumn({
      columnId: "taskPriority",
      compare: (a, b) => (a.tdvsp_priority ?? 0) - (b.tdvsp_priority ?? 0),
      renderHeaderCell: () => "Priority",
      renderCell: (item) => {
        if (item.tdvsp_priority == null) return <Text>--</Text>;
        const label = priorityShortLabels[item.tdvsp_priority] ?? "--";
        const colors = priorityColors[item.tdvsp_priority];
        return colors ? renderBadge(label, colors) : <Text>{label}</Text>;
      },
    }),
    createTableColumn({
      columnId: "taskType",
      compare: (a, b) => (a.tdvsp_tasktype ?? 0) - (b.tdvsp_tasktype ?? 0),
      renderHeaderCell: () => "Type",
      renderCell: (item) => {
        if (item.tdvsp_tasktype == null) return <Text>--</Text>;
        const label = taskTypeLabels[item.tdvsp_tasktype as TaskType] ?? "--";
        const colors = typeColors[item.tdvsp_tasktype];
        return colors ? renderBadge(label, colors) : <Text>{label}</Text>;
      },
    }),
    createTableColumn({
      columnId: "customer",
      compare: (a, b) =>
        (a.tdvsp_Customer?.name ?? "").localeCompare(b.tdvsp_Customer?.name ?? ""),
      renderHeaderCell: () => "Customer",
      renderCell: (item) => (
        <Text
          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={item.tdvsp_Customer?.name ?? ""}
        >
          {item.tdvsp_Customer?.name ?? "--"}
        </Text>
      ),
    }),
    createTableColumn({
      columnId: "actions",
      renderHeaderCell: () => "",
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
            onClick={() =>
              item.tdvsp_actionitemid &&
              handleDeactivate(item.tdvsp_actionitemid)
            }
          />
        </div>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <CheckboxChecked24Filled style={{ color: "#f87171", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" }}>tasks</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dropdown
          value={typeFilter === "all" ? "All" : typeFilter === "work" ? "Work" : "Personal"}
          selectedOptions={[typeFilter]}
          onOptionSelect={(_, d) => setTypeFilter((d.optionValue as "all" | "work" | "personal") ?? "work")}
          style={{ minWidth: "130px" }}
        >
          <Option value="work">Work</Option>
          <Option value="personal">Personal</Option>
          <Option value="all">All</Option>
        </Dropdown>
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Task
          </Button>
          <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
            <DialogBody>
              <DialogTitle>New Task</DialogTitle>
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
                      placeholder="Add details about this task..."
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
                  <div className={styles.formField}>
                    <Label>Priority</Label>
                    <Dropdown
                      placeholder="Select priority"
                      value={
                        formData.tdvsp_priority
                          ? taskPriorityLabels[Number(formData.tdvsp_priority) as TaskPriority] ?? ""
                          : ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          tdvsp_priority: d.optionValue ?? "",
                        })
                      }
                    >
                      {taskPriorityOrder.map(
                        (value) => (
                          <Option key={value} value={String(value)}>
                            {taskPriorityLabels[value]}
                          </Option>
                        )
                      )}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Task Type</Label>
                    <Dropdown
                      placeholder="Select type"
                      value={
                        formData.tdvsp_tasktype
                          ? taskTypeLabels[Number(formData.tdvsp_tasktype) as TaskType] ?? ""
                          : ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          tdvsp_tasktype: d.optionValue ?? "",
                        })
                      }
                    >
                      {(Object.entries(taskTypeLabels) as [string, string][]).map(
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
                <Button appearance="primary" onClick={handleSaveNew} disabled={saving || !formData.tdvsp_name.trim()}>
                  {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      <Card className={styles.card}>
        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner label="Loading tasks..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <TaskListSquareLtr24Filled
              style={{ fontSize: 48, color: "#3dd68c", marginBottom: 16 }}
            />
            <Subtitle1>No tasks found</Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              Create your first task to start tracking.
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
                {({ renderHeaderCell, columnId }) => (
                  <DataGridHeaderCell style={columnSizes[columnId as string]}>
                    {renderHeaderCell()}
                  </DataGridHeaderCell>
                )}
              </DataGridRow>
            </DataGridHeader>
            <DataGridBody<ActionItem>>
              {({ item, rowId }) => (
                <DataGridRow<ActionItem> key={rowId}>
                  {({ renderCell, columnId }) => (
                    <DataGridCell style={columnSizes[columnId as string]}>
                      {renderCell(item)}
                    </DataGridCell>
                  )}
                </DataGridRow>
              )}
            </DataGridBody>
          </DataGrid>
        )}
      </Card>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
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
              Task Details
            </DialogTitle>
            <DialogContent>
              {viewingItem && (
                <div className={styles.viewLayout}>
                  <div className={styles.viewDetails}>
                    <div className={styles.viewField}>
                      <Label>Name</Label>
                      {isEditing ? (
                        <Input
                          value={formData.tdvsp_name}
                          onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })}
                        />
                      ) : (
                        <Text block size={400} weight="semibold">
                          {viewingItem.tdvsp_name}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea
                          value={formData.tdvsp_description}
                          onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })}
                          rows={4}
                          resize="vertical"
                        />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>
                          {viewingItem.tdvsp_description || "--"}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewGrid}>
                      <div className={styles.viewField}>
                        <Label>Date</Label>
                        {isEditing ? (
                          <Input
                            type="date"
                            value={formData.tdvsp_date}
                            onChange={(_, d) => setFormData({ ...formData, tdvsp_date: d.value })}
                          />
                        ) : (
                          <Text block size={400} style={viewingItem.tdvsp_date && isOverdue(viewingItem.tdvsp_date) ? { color: "#f87171", fontWeight: 600 } : undefined}>
                            {viewingItem.tdvsp_date ? formatDate(viewingItem.tdvsp_date) : "--"}
                          </Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Task Status</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select status"
                            value={formData.tdvsp_taskstatus ? taskStatusLabels[Number(formData.tdvsp_taskstatus) as TaskStatus] ?? "" : ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_taskstatus: d.optionValue ?? "" })}
                          >
                            {(Object.entries(taskStatusLabels) as [string, string][]).map(([value, label]) => (
                              <Option key={value} value={value}>{label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          viewingItem.tdvsp_taskstatus != null && statusColors[viewingItem.tdvsp_taskstatus]
                            ? renderBadge(statusShortLabels[viewingItem.tdvsp_taskstatus] ?? "--", statusColors[viewingItem.tdvsp_taskstatus])
                            : <Text block size={400}>--</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Priority</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select priority"
                            value={formData.tdvsp_priority ? taskPriorityLabels[Number(formData.tdvsp_priority) as TaskPriority] ?? "" : ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_priority: d.optionValue ?? "" })}
                          >
                            {taskPriorityOrder.map((value) => (
                              <Option key={value} value={String(value)}>{taskPriorityLabels[value]}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          viewingItem.tdvsp_priority != null && priorityColors[viewingItem.tdvsp_priority]
                            ? renderBadge(priorityShortLabels[viewingItem.tdvsp_priority] ?? "--", priorityColors[viewingItem.tdvsp_priority])
                            : <Text block size={400}>--</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Task Type</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select type"
                            value={formData.tdvsp_tasktype ? taskTypeLabels[Number(formData.tdvsp_tasktype) as TaskType] ?? "" : ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_tasktype: d.optionValue ?? "" })}
                          >
                            {(Object.entries(taskTypeLabels) as [string, string][]).map(([value, label]) => (
                              <Option key={value} value={value}>{label}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          viewingItem.tdvsp_tasktype != null && typeColors[viewingItem.tdvsp_tasktype]
                            ? renderBadge(taskTypeLabels[viewingItem.tdvsp_tasktype as TaskType] ?? "--", typeColors[viewingItem.tdvsp_tasktype])
                            : <Text block size={400}>--</Text>
                        )}
                      </div>
                      <div className={styles.viewField}>
                        <Label>Customer</Label>
                        {isEditing ? (
                          <Dropdown
                            placeholder="Select account"
                            value={accounts.find((a) => a.accountid === formData.customerAccountId)?.name ?? ""}
                            onOptionSelect={(_, d) => setFormData({ ...formData, customerAccountId: d.optionValue ?? "" })}
                          >
                            {accounts.map((a) => (
                              <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                            ))}
                          </Dropdown>
                        ) : (
                          <Text block size={400}>
                            {viewingItem.tdvsp_Customer?.name || "--"}
                          </Text>
                        )}
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
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving || !formData.tdvsp_name.trim()}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingItem && openEdit(viewingItem)}
                >
                  Edit
                </Button>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
