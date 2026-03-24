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
  Flash24Filled,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  TextBulletListLtr20Regular,
  Grid20Regular,
} from "@fluentui/react-icons";
import { Impact, Account } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getImpacts,
  createImpact,
  updateImpact,
  deactivateImpact,
  getAccounts,
} from "../services/dataverseService";
import { useNotification } from "../context/NotificationContext";

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

const dateBadgeColors = { bg: "rgba(245, 158, 11, 0.15)", text: "#f59e0b" };
const accountBadgeColors = { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" };

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
    borderLeft: "3px solid #f59e0b",
    boxShadow: "none",
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
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
  tileGrid: {
    display: "flex",
    flexWrap: "wrap" as const,
    ...shorthands.gap("10px"),
  },
  tile: {
    display: "flex",
    flexDirection: "column" as const,
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
    flexDirection: "column" as const,
    ...shorthands.gap("4px"),
    width: "100%",
    marginTop: "8px",
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
  description: { flex: "2 1 180px", minWidth: 180 },
  customer: { flex: "1.5 1 120px", minWidth: 120 },
  actions: { flex: "0 0 72px", minWidth: 72 },
};

interface FormData {
  tdvsp_name: string;
  tdvsp_description: string;
  tdvsp_date: string;
  customerAccountId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_description: "",
  tdvsp_date: "",
  customerAccountId: "",
};

export const Impacts: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [impacts, setImpacts] = useState<Impact[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingImpact, setViewingImpact] = useState<Impact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "tiles">(() =>
    (localStorage.getItem("og-impacts-view-mode") as "list" | "tiles") || "list"
  );
  const toggleViewMode = (mode: "list" | "tiles") => {
    setViewMode(mode);
    localStorage.setItem("og-impacts-view-mode", mode);
  };

  const loadImpacts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getImpacts();
      setImpacts(data);
    } catch (err) {
      console.error("Failed to load impacts:", err);
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
    loadImpacts();
    loadAccounts();
  }, [loadImpacts, loadAccounts]);

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

  const openView = (impact: Impact) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingImpact(impact);
    setViewDialogOpen(true);
  };

  const openEdit = (impact: Impact) => {
    setViewingImpact(impact);
    setViewDialogOpen(true);
    setEditingId(impact.tdvsp_impactid ?? null);
    setFormData({
      tdvsp_name: impact.tdvsp_name,
      tdvsp_description: impact.tdvsp_description,
      tdvsp_date: impact.tdvsp_date ? impact.tdvsp_date.split("T")[0] : "",
      customerAccountId: impact.tdvsp_Customer?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildImpactPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_description: string;
      tdvsp_date: string;
      "tdvsp_Customer@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name,
      tdvsp_description: formData.tdvsp_description,
      tdvsp_date: formData.tdvsp_date,
    };
    if (formData.customerAccountId) {
      payload["tdvsp_Customer@odata.bind"] = `/accounts(${formData.customerAccountId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createImpact(buildImpactPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadImpacts();
      notify("Impact created");
    } catch (err) {
      console.error("Failed to save impact:", err);
      notify("Failed to save impact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateImpact(editingId, buildImpactPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedImpacts = await getImpacts();
      setImpacts(updatedImpacts);
      const updated = updatedImpacts.find((i) => i.tdvsp_impactid === viewingImpact?.tdvsp_impactid);
      if (updated) setViewingImpact(updated);
      notify("Impact updated");
    } catch (err) {
      console.error("Failed to save impact:", err);
      notify("Failed to save impact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateImpact(id);
      loadImpacts();
      notify("Impact deactivated");
    } catch (err) {
      console.error("Failed to deactivate impact:", err);
      notify("Failed to deactivate impact", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = impacts.filter((imp) => {
    const q = searchQuery.toLowerCase();
    return (
      imp.tdvsp_name?.toLowerCase().includes(q) ||
      imp.tdvsp_description?.toLowerCase().includes(q) ||
      imp.tdvsp_Customer?.name?.toLowerCase().includes(q)
    );
  });

  const gridColumns: TableColumnDefinition<Impact>[] = [
    createTableColumn({
      columnId: "date",
      compare: (a, b) => (a.tdvsp_date ?? "").localeCompare(b.tdvsp_date ?? ""),
      renderHeaderCell: () => "Date",
      renderCell: (item) =>
        item.tdvsp_date
          ? renderBadge(formatDate(item.tdvsp_date), dateBadgeColors)
          : <Text>--</Text>,
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
      columnId: "description",
      compare: (a, b) => (a.tdvsp_description ?? "").localeCompare(b.tdvsp_description ?? ""),
      renderHeaderCell: () => "Description",
      renderCell: (item) => (
        <Text
          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={item.tdvsp_description ?? ""}
        >
          {item.tdvsp_description || "--"}
        </Text>
      ),
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
              item.tdvsp_impactid && handleDeactivate(item.tdvsp_impactid)
            }
          />
        </div>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <Flash24Filled style={{ color: "#f59e0b", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" }}>impacts</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search impacts..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <div className={styles.viewToggle}>
          <Button appearance={viewMode === "list" ? "primary" : "subtle"} icon={<TextBulletListLtr20Regular />} size="small" onClick={() => toggleViewMode("list")} aria-label="List view" style={{ minWidth: "auto" }} />
          <Button appearance={viewMode === "tiles" ? "primary" : "subtle"} icon={<Grid20Regular />} size="small" onClick={() => toggleViewMode("tiles")} aria-label="Tile view" style={{ minWidth: "auto" }} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Impact
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Impact</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="Brief title for this impact"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.tdvsp_description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_description: d.value })
                      }
                      placeholder="Describe the impact..."
                      rows={4}
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

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner label="Loading impacts..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Flash24Filled style={{ fontSize: 48, color: "#f59e0b", marginBottom: 16 }} />
          <Subtitle1>No impacts found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first impact to start tracking.
          </Caption1>
        </div>
      ) : viewMode === "list" ? (
        <Card className={styles.card}>
          <DataGrid
            items={filtered}
            columns={gridColumns}
            getRowId={(item) => item.tdvsp_impactid ?? item.tdvsp_name}
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
            <DataGridBody<Impact>>
              {({ item, rowId }) => (
                <DataGridRow<Impact> key={rowId}>
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
      ) : (
        <div className={styles.tileGrid}>
          {filtered.map((impact) => (
            <div key={impact.tdvsp_impactid} className={styles.tile} onClick={() => openView(impact)}>
              <Text className={styles.tileName}>{impact.tdvsp_name}</Text>
              <div className={styles.tileMeta}>
                {impact.tdvsp_date && renderBadge(formatDate(impact.tdvsp_date), dateBadgeColors)}
                {impact.tdvsp_Customer?.name && renderBadge(impact.tdvsp_Customer.name, accountBadgeColors)}
                {impact.tdvsp_description && <Caption1 style={{ color: tokens.colorNeutralForeground3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{impact.tdvsp_description}</Caption1>}
              </div>
            </div>
          ))}
        </div>
      )}

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
              Impact Details
            </DialogTitle>
            <DialogContent>
              {viewingImpact && (
                <>
                  <div className={styles.viewField}>
                    <Label>Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.tdvsp_name}
                        onChange={(_, d) => setFormData({ ...formData, tdvsp_name: d.value })}
                      />
                    ) : (
                      <Text block size={400} weight="semibold">
                        {viewingImpact.tdvsp_name}
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
                      />
                    ) : (
                      <Text block size={400}>
                        {viewingImpact.tdvsp_description || "--"}
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
                        viewingImpact.tdvsp_date
                          ? renderBadge(formatDate(viewingImpact.tdvsp_date), dateBadgeColors)
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
                        viewingImpact.tdvsp_Customer?.name
                          ? renderBadge(viewingImpact.tdvsp_Customer.name, accountBadgeColors)
                          : <Text block size={400}>--</Text>
                      )}
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              {isEditing ? (
                <>
                  <Button appearance="secondary" disabled={saving} onClick={() => { setIsEditing(false); setEditingId(null); }}>Cancel</Button>
                  <Button appearance="primary" onClick={handleSaveEdit} disabled={saving}>
                    {saving ? <><Spinner size="tiny" /> Saving...</> : "Save"}
                  </Button>
                </>
              ) : (
                <Button
                  appearance="primary"
                  icon={<Edit24Regular />}
                  onClick={() => viewingImpact && openEdit(viewingImpact)}
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
