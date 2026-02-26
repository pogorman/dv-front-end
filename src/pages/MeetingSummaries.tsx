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
  Textarea,
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
  PeopleTeam24Filled,
} from "@fluentui/react-icons";
import { MeetingSummary, Account } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getMeetingSummaries,
  createMeetingSummary,
  updateMeetingSummary,
  deactivateMeetingSummary,
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

const dateBadgeColors = { bg: "rgba(61, 214, 140, 0.15)", text: "#3dd68c" };
const accountBadgeColors = { bg: "rgba(74, 158, 255, 0.15)", text: "#4a9eff" };

const columnSizes: Record<string, React.CSSProperties> = {
  date: { flex: "0 0 95px", minWidth: 95 },
  name: { flex: "2 1 200px", minWidth: 200 },
  account: { flex: "1.5 1 140px", minWidth: 140 },
  summary: { flex: "3 1 250px", minWidth: 250 },
  actions: { flex: "0 0 72px", minWidth: 72 },
};

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
    borderLeft: "3px solid #3dd68c",
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
  summaryText: {
    whiteSpace: "pre-wrap",
    maxHeight: "300px",
    overflowY: "auto",
    ...shorthands.padding("12px"),
    backgroundColor: tokens.colorNeutralBackground2,
    ...shorthands.borderRadius("8px"),
  },
});

interface FormData {
  tdvsp_name: string;
  tdvsp_date: string;
  tdvsp_summary: string;
  accountId: string;
}

const emptyForm: FormData = {
  tdvsp_name: "",
  tdvsp_date: "",
  tdvsp_summary: "",
  accountId: "",
};

export const MeetingSummaries: React.FC = () => {
  const styles = useStyles();
  const { notify } = useNotification();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summaries, setSummaries] = useState<MeetingSummary[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingSummary, setViewingSummary] = useState<MeetingSummary | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadSummaries = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMeetingSummaries();
      setSummaries(data);
    } catch (err) {
      console.error("Failed to load meeting summaries:", err);
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
    loadSummaries();
    loadAccounts();
  }, [loadSummaries, loadAccounts]);

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

  const openView = (summary: MeetingSummary) => {
    setIsEditing(false);
    setEditingId(null);
    setViewingSummary(summary);
    setViewDialogOpen(true);
  };

  const openEdit = (summary: MeetingSummary) => {
    setViewingSummary(summary);
    setViewDialogOpen(true);
    setEditingId(summary.tdvsp_meetingsummaryid ?? null);
    setFormData({
      tdvsp_name: summary.tdvsp_name,
      tdvsp_date: summary.tdvsp_date ? summary.tdvsp_date.split("T")[0] : "",
      tdvsp_summary: summary.tdvsp_summary ?? "",
      accountId: summary.tdvsp_Account?.accountid ?? "",
    });
    setIsEditing(true);
  };

  const buildSummaryPayload = () => {
    const payload: {
      tdvsp_name: string;
      tdvsp_date?: string;
      tdvsp_summary?: string;
      "tdvsp_Account@odata.bind"?: string;
    } = {
      tdvsp_name: formData.tdvsp_name,
    };
    if (formData.tdvsp_date) {
      payload.tdvsp_date = formData.tdvsp_date;
    }
    if (formData.tdvsp_summary) {
      payload.tdvsp_summary = formData.tdvsp_summary;
    }
    if (formData.accountId) {
      payload["tdvsp_Account@odata.bind"] = `/accounts(${formData.accountId})`;
    }
    return payload;
  };

  const handleSaveNew = async () => {
    setSaving(true);
    try {
      await createMeetingSummary(buildSummaryPayload());
      setDialogOpen(false);
      setFormData(emptyForm);
      loadSummaries();
      notify("Meeting summary created");
    } catch (err) {
      console.error("Failed to save meeting summary:", err);
      notify("Failed to save meeting summary", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      await updateMeetingSummary(editingId, buildSummaryPayload());
      setIsEditing(false);
      setEditingId(null);
      const updatedSummaries = await getMeetingSummaries();
      setSummaries(updatedSummaries);
      const updated = updatedSummaries.find((s) => s.tdvsp_meetingsummaryid === viewingSummary?.tdvsp_meetingsummaryid);
      if (updated) setViewingSummary(updated);
      notify("Meeting summary updated");
    } catch (err) {
      console.error("Failed to save meeting summary:", err);
      notify("Failed to save meeting summary", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setSaving(true);
    try {
      await deactivateMeetingSummary(id);
      loadSummaries();
      notify("Meeting summary deactivated");
    } catch (err) {
      console.error("Failed to deactivate meeting summary:", err);
      notify("Failed to deactivate meeting summary", undefined, "error");
    } finally {
      setSaving(false);
    }
  };

  const filtered = summaries.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.tdvsp_name?.toLowerCase().includes(q) ||
      s.tdvsp_summary?.toLowerCase().includes(q) ||
      s.tdvsp_Account?.name?.toLowerCase().includes(q)
    );
  });

  const gridColumns: TableColumnDefinition<MeetingSummary>[] = [
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
      columnId: "account",
      compare: (a, b) =>
        (a.tdvsp_Account?.name ?? "").localeCompare(b.tdvsp_Account?.name ?? ""),
      renderHeaderCell: () => "Account",
      renderCell: (item) =>
        item.tdvsp_Account?.name
          ? renderBadge(item.tdvsp_Account.name, accountBadgeColors)
          : <Text>--</Text>,
    }),
    createTableColumn({
      columnId: "summary",
      compare: (a, b) => (a.tdvsp_summary ?? "").localeCompare(b.tdvsp_summary ?? ""),
      renderHeaderCell: () => "Summary",
      renderCell: (item) => (
        <Text
          style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          title={item.tdvsp_summary ?? ""}
        >
          {item.tdvsp_summary || "--"}
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
              item.tdvsp_meetingsummaryid && handleDeactivate(item.tdvsp_meetingsummaryid)
            }
          />
        </div>
      ),
    }),
  ];

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <PeopleTeam24Filled style={{ color: "#3dd68c", fontSize: 28 }} />
        <Subtitle1 style={{ fontFamily: "Inter, monospace", letterSpacing: "0.05em", textTransform: "lowercase" }}>summaries</Subtitle1>
      </div>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search summaries..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Summary
          </Button>
          <DialogSurface style={{ maxWidth: "700px", width: "700px" }}>
            <DialogBody>
              <DialogTitle>New Summary</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="Meeting title or name"
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={formData.tdvsp_date}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_date: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Account</Label>
                    <Dropdown
                      placeholder="Select account"
                      value={
                        accounts.find((a) => a.accountid === formData.accountId)?.name ?? ""
                      }
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          accountId: d.optionValue ?? "",
                        })
                      }
                    >
                      {accounts.map((a) => (
                        <Option key={a.accountid} value={a.accountid!} text={a.name}>
                          {a.name}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Summary</Label>
                    <Textarea
                      value={formData.tdvsp_summary}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_summary: d.value })
                      }
                      placeholder="Enter meeting summary (up to 5000 characters)..."
                      rows={10}
                      style={{ resize: "vertical", minHeight: "200px" }}
                      maxLength={5000}
                    />
                    <Caption1 style={{ color: tokens.colorNeutralForeground3, textAlign: "right" }}>
                      {formData.tdvsp_summary.length} / 5000
                    </Caption1>
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
            <Spinner label="Loading summaries..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <PeopleTeam24Filled style={{ fontSize: 48, color: "#3dd68c", marginBottom: 16 }} />
            <Subtitle1>No summaries found</Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              Create your first summary to start tracking.
            </Caption1>
          </div>
        ) : (
          <DataGrid
            items={filtered}
            columns={gridColumns}
            getRowId={(item) => item.tdvsp_meetingsummaryid ?? item.tdvsp_name}
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
            <DataGridBody<MeetingSummary>>
              {({ item, rowId }) => (
                <DataGridRow<MeetingSummary> key={rowId}>
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
        <DialogSurface style={{ maxWidth: "700px", width: "700px" }}>
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
              Summary Details
            </DialogTitle>
            <DialogContent>
              {viewingSummary && (
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
                        {viewingSummary.tdvsp_name}
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
                        viewingSummary.tdvsp_date
                          ? renderBadge(formatDate(viewingSummary.tdvsp_date), dateBadgeColors)
                          : <Text block size={400}>--</Text>
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
                            <Option key={a.accountid} value={a.accountid!} text={a.name}>{a.name}</Option>
                          ))}
                        </Dropdown>
                      ) : (
                        viewingSummary.tdvsp_Account?.name
                          ? renderBadge(viewingSummary.tdvsp_Account.name, accountBadgeColors)
                          : <Text block size={400}>--</Text>
                      )}
                    </div>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Summary</Label>
                    {isEditing ? (
                      <>
                        <Textarea
                          value={formData.tdvsp_summary}
                          onChange={(_, d) => setFormData({ ...formData, tdvsp_summary: d.value })}
                          rows={10}
                          style={{ resize: "vertical", minHeight: "200px" }}
                          maxLength={5000}
                        />
                        <Caption1 style={{ color: tokens.colorNeutralForeground3, textAlign: "right" }}>
                          {formData.tdvsp_summary.length} / 5000
                        </Caption1>
                      </>
                    ) : (
                      <div className={styles.summaryText}>
                        <Text size={400}>
                          {viewingSummary.tdvsp_summary || "--"}
                        </Text>
                      </div>
                    )}
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
                  onClick={() => viewingSummary && openEdit(viewingSummary)}
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
