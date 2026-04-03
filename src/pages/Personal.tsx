import React, { useEffect, useState, useCallback } from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Text,
  Caption1,
  Body1,
  Subtitle1,
  Badge,
  Button,
  Spinner,
  Input,
  Label,
  Textarea,
  Dropdown,
  Option,
  Card,
  Dialog,
  DialogSurface,
  DialogBody,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  Sparkle24Filled,
  Search24Regular,
  TextBulletListLtr20Regular,
  Grid20Regular,
} from "@fluentui/react-icons";
import {
  ActionItem,
  Account,
  TaskStatus,
  taskStatusLabels,
  taskPriorityLabels,
  taskPriorityOrder,
  TaskType,
} from "../types";
import {
  getActionItems,
  getAccounts,
  updateActionItem,
  deactivateActionItem,
} from "../services/dataverseService";
import { NotesTimeline } from "../components/NotesTimeline";
import { useNotification } from "../context/NotificationContext";
import { formatDate } from "../utils/formatDate";
import { priorityToColor, priorityToBackground, colorToPriority } from "../utils/tileColors";
import TileColorPicker from "../components/TileColorPicker";

const statusColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" },
  468510001: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510002: { bg: "rgba(167, 139, 250, 0.15)", text: "#a78bfa" },
  468510003: { bg: "rgba(107, 114, 128, 0.15)", text: "#6b7280" },
  468510004: { bg: "rgba(34, 211, 238, 0.15)", text: "#22d3ee" },
  468510005: { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" },
};

const priorityColors: Record<number, { bg: string; text: string }> = {
  468510000: { bg: "rgba(107, 114, 128, 0.15)", text: "#6b7280" },
  468510001: { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" },
  468510002: { bg: "rgba(248, 113, 113, 0.15)", text: "#f87171" },
  468510003: { bg: "rgba(167, 139, 250, 0.15)", text: "#a78bfa" },
};

const statusShortLabels: Record<number, string> = {
  468510000: "Pondering",
  468510001: "In Progress",
  468510002: "Pending Comm",
  468510003: "On Hold",
  468510004: "Wrapping Up",
  468510005: "Complete",
};

const priorityShortLabels: Record<number, string> = {
  468510000: "Low",
  468510001: "Eh",
  468510002: "Top Priority",
  468510003: "High",
};

const renderBadge = (label: string, colors: { bg: string; text: string }) => (
  <span style={{
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    backgroundColor: colors.bg,
    color: colors.text,
    fontWeight: 500,
  }}>{label}</span>
);

const isOverdue = (date: string) => new Date(date) < new Date();

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    ...shorthands.padding("0", "4px"),
  },
  tileGrid: {
    display: "flex",
    flexWrap: "wrap",
    ...shorthands.gap("10px"),
  },
  tile: {
    display: "flex",
    flexDirection: "column",
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
    position: "relative" as const,
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
    flexDirection: "column",
    ...shorthands.gap("4px"),
    width: "100%",
    marginTop: "8px",
  },
  emptyState: {
    color: tokens.colorNeutralForeground3,
    fontStyle: "italic",
    ...shorthands.padding("20px"),
  },
  viewLayout: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
  },
  viewDetails: {
    display: "flex",
    flexDirection: "column",
  },
  viewField: {
    marginBottom: "12px",
  },
  viewNotes: {
    display: "flex",
    flexDirection: "column",
  },
  nameLink: {
    cursor: "pointer",
    color: tokens.colorBrandForeground1,
    ":hover": {
      textDecoration: "underline",
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap" as const,
    ...shorthands.gap("12px"),
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
  },
  searchBox: {
    minWidth: "280px",
  },
  card: {
    ...shorthands.padding("0px"),
    ...shorthands.borderRadius("8px"),
    overflow: "hidden" as const,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    borderLeft: "3px solid #22d3ee",
    boxShadow: "none",
  },
  viewToggle: {
    display: "flex",
    ...shorthands.gap("2px"),
    backgroundColor: tokens.colorNeutralBackground3,
    ...shorthands.borderRadius("6px"),
    ...shorthands.padding("2px"),
  },
});

const columnSizes: Record<string, React.CSSProperties> = {
  date: { flex: "0 0 95px", minWidth: 95 },
  name: { flex: "3 1 200px", minWidth: 200 },
  taskStatus: { flex: "0 0 150px", minWidth: 150 },
  taskPriority: { flex: "0 0 115px", minWidth: 115 },
  customer: { flex: "1.5 1 120px", minWidth: 120 },
  actions: { flex: "0 0 72px", minWidth: 72 },
};

const isOverdueDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};

const emptyForm = {
  tdvsp_name: "",
  tdvsp_date: "",
  tdvsp_description: "",
  tdvsp_taskstatus: "",
  tdvsp_priority: "",
  tdvsp_tasktype: "468510000",
  customerAccountId: "",
};

export const Personal: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();

  const [items, setItems] = useState<ActionItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ActionItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "tiles">(() =>
    (localStorage.getItem("og-personal-view-mode") as "list" | "tiles") || "tiles"
  );



  const toggleViewMode = (mode: "list" | "tiles") => {
    setViewMode(mode);
    localStorage.setItem("og-personal-view-mode", mode);
  };

  const loadItems = useCallback(async () => {
    setLoading(true);
    try {
      const [allItems, accts] = await Promise.all([getActionItems(), getAccounts()]);
      const personal = allItems
        .filter((t) => t.tdvsp_tasktype === (468510000 as TaskType) && t.tdvsp_taskstatus !== (468510005 as TaskStatus))
        .sort((a, b) => new Date(a.tdvsp_date).getTime() - new Date(b.tdvsp_date).getTime());
      setItems(personal);
      setAccounts(accts);
    } catch (err) {
      console.error("Failed to load personal items:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

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
      tdvsp_date: item.tdvsp_date,
      tdvsp_description: item.tdvsp_description || "",
      tdvsp_taskstatus: item.tdvsp_taskstatus != null ? String(item.tdvsp_taskstatus) : "",
      tdvsp_priority: item.tdvsp_priority != null ? String(item.tdvsp_priority) : "",
      tdvsp_tasktype: item.tdvsp_tasktype != null ? String(item.tdvsp_tasktype) : "468510000",
      customerAccountId: item._tdvsp_customer_value || "",
    });
    setIsEditing(true);
  };

  const buildPayload = () => {
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
      tdvsp_tasktype: formData.tdvsp_tasktype ? Number(formData.tdvsp_tasktype) : 468510000,
    };
    if (formData.customerAccountId) {
      payload["tdvsp_Customer@odata.bind"] = `/accounts(${formData.customerAccountId})`;
    }
    return payload;
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateActionItem(editingId, buildPayload());
      setIsEditing(false);
      setEditingId(null);
      await loadItems();
      const updated = items.find((t) => t.tdvsp_actionitemid === viewingItem?.tdvsp_actionitemid);
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
      setViewDialogOpen(false);
      await loadItems();
      notify("Task deactivated");
    } catch (err) {
      console.error("Failed to deactivate task:", err);
      notify("Failed to deactivate task", undefined, "error");
    } finally {
      setSaving(false);
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
      renderCell: (item) => {
        const overdue = item.tdvsp_date ? isOverdueDate(item.tdvsp_date) : false;
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
      columnId: "customer",
      compare: (a, b) =>
        (a.tdvsp_Customer?.name ?? "").localeCompare(b.tdvsp_Customer?.name ?? ""),
      renderHeaderCell: () => "Account",
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

  if (loading) {
    return <Spinner label="Loading personal tasks..." />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Sparkle24Filled style={{ color: "#22d3ee", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" }}>personal</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Input
            className={styles.searchBox}
            contentBefore={<Search24Regular />}
            placeholder="Search personal tasks..."
            value={searchQuery}
            onChange={(_, d) => setSearchQuery(d.value)}
          />
        </div>
        <div className={styles.viewToggle}>
          <Button
            appearance={viewMode === "list" ? "primary" : "subtle"}
            icon={<TextBulletListLtr20Regular />}
            size="small"
            onClick={() => toggleViewMode("list")}
            aria-label="List view"
            style={{ minWidth: "auto" }}
          />
          <Button
            appearance={viewMode === "tiles" ? "primary" : "subtle"}
            icon={<Grid20Regular />}
            size="small"
            onClick={() => toggleViewMode("tiles")}
            aria-label="Tile view"
            style={{ minWidth: "auto" }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <Body1 className={styles.emptyState}>No personal tasks</Body1>
      ) : viewMode === "tiles" ? (
        <div className={styles.tileGrid}>
          {filtered.map((t) => (
            <div
              key={t.tdvsp_actionitemid}
              className={`${styles.tile} tile-color-host`}
              onClick={() => openView(t)}
              style={{ position: "relative", backgroundColor: priorityToBackground(t.tdvsp_priority) }}
            >
              <TileColorPicker currentColor={priorityToColor(t.tdvsp_priority)} onColorChange={async (color) => { try { await updateActionItem(t.tdvsp_actionitemid!, { tdvsp_priority: colorToPriority(color) ?? undefined }); loadItems(); } catch (err) { console.error(err); } }} />
              <Text className={styles.tileName}>{t.tdvsp_name}</Text>
              <div className={styles.tileMeta}>
                <Caption1
                  style={t.tdvsp_date && isOverdue(t.tdvsp_date) ? { color: "#f87171", fontWeight: 600 } : { color: tokens.colorNeutralForeground3 }}
                >
                  {t.tdvsp_date ? formatDate(t.tdvsp_date) : "No date"}
                </Caption1>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {t.tdvsp_priority === 468510002 && (
                    <Badge appearance="filled" size="small" color="danger">Top Priority</Badge>
                  )}
                  {t.tdvsp_date && isOverdue(t.tdvsp_date) && t.tdvsp_priority !== 468510002 && (
                    <Badge appearance="filled" size="small" color="warning">Overdue</Badge>
                  )}
                  {t.tdvsp_taskstatus != null && statusColors[t.tdvsp_taskstatus] && (
                    renderBadge(statusShortLabels[t.tdvsp_taskstatus] ?? "", statusColors[t.tdvsp_taskstatus])
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className={styles.card}>
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
        </Card>
      )}

      {/* View/Edit Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => { setViewDialogOpen(d.open); if (!d.open) { setIsEditing(false); setEditingId(null); } }}>
        <DialogSurface style={{ maxWidth: "70vw", width: "70vw" }}>
          <DialogBody>
            <DialogTitle
              action={<Button appearance="subtle" icon={<Dismiss24Regular />} onClick={() => setViewDialogOpen(false)} />}
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
                        <Input value={formData.tdvsp_name} onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })} />
                      ) : (
                        <Text block size={400} weight="semibold">{viewingItem.tdvsp_name}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Description</Label>
                      {isEditing ? (
                        <Textarea value={formData.tdvsp_description} onChange={(_, d) => setFormData({ ...formData, tdvsp_description: d.value })} rows={4} resize="vertical" />
                      ) : (
                        <Text block size={400} style={{ whiteSpace: "pre-wrap" }}>{viewingItem.tdvsp_description || "--"}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Date</Label>
                      {isEditing ? (
                        <Input type="date" value={formData.tdvsp_date} onChange={(_, d) => setFormData({ ...formData, tdvsp_date: d.value })} />
                      ) : (
                        <Text block size={400} style={viewingItem.tdvsp_date && isOverdue(viewingItem.tdvsp_date) ? { color: "#f87171", fontWeight: 600 } : undefined}>
                          {viewingItem.tdvsp_date ? formatDate(viewingItem.tdvsp_date) : "--"}
                        </Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Status</Label>
                      {isEditing ? (
                        <Dropdown value={formData.tdvsp_taskstatus ? (statusShortLabels[Number(formData.tdvsp_taskstatus)] ?? "") : ""} selectedOptions={formData.tdvsp_taskstatus ? [formData.tdvsp_taskstatus] : []} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_taskstatus: d.optionValue ?? "" })}>
                          {Object.entries(taskStatusLabels).map(([val, label]) => (
                            <Option key={val} value={val}>{label}</Option>
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
                        <Dropdown value={formData.tdvsp_priority ? (priorityShortLabels[Number(formData.tdvsp_priority)] ?? "") : ""} selectedOptions={formData.tdvsp_priority ? [formData.tdvsp_priority] : []} onOptionSelect={(_, d) => setFormData({ ...formData, tdvsp_priority: d.optionValue ?? "" })}>
                          {taskPriorityOrder.map((val) => (
                            <Option key={val} value={String(val)}>{taskPriorityLabels[val]}</Option>
                          ))}
                        </Dropdown>
                      ) : (
                        viewingItem.tdvsp_priority != null && priorityColors[viewingItem.tdvsp_priority]
                          ? renderBadge(priorityShortLabels[viewingItem.tdvsp_priority] ?? "--", priorityColors[viewingItem.tdvsp_priority])
                          : <Text block size={400}>--</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Account</Label>
                      {isEditing ? (
                        <Dropdown value={accounts.find((a) => a.accountid === formData.customerAccountId)?.name ?? ""} selectedOptions={formData.customerAccountId ? [formData.customerAccountId] : []} onOptionSelect={(_, d) => setFormData({ ...formData, customerAccountId: d.optionValue ?? "" })}>
                          <Option value="">None</Option>
                          {accounts.map((a) => (
                            <Option key={a.accountid} value={a.accountid!}>{a.name}</Option>
                          ))}
                        </Dropdown>
                      ) : (
                        <Text block size={400}>{viewingItem.tdvsp_Customer?.name || "--"}</Text>
                      )}
                    </div>
                    <div className={styles.viewField}>
                      <Label>Created On</Label>
                      <Text block size={400}>{viewingItem.createdon ? formatDate(viewingItem.createdon) : "--"}</Text>
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
                <>
                  <Button appearance="primary" icon={<Edit24Regular />} onClick={() => viewingItem && openEdit(viewingItem)}>Edit</Button>
                  <Button appearance="secondary" onClick={() => viewingItem && handleDeactivate(viewingItem.tdvsp_actionitemid!)} disabled={saving}>
                    {saving ? <><Spinner size="tiny" /> Deactivating...</> : "Deactivate"}
                  </Button>
                </>
              )}
            </DialogActions>
          </DialogBody>
        </DialogSurface>
      </Dialog>
    </div>
  );
};
