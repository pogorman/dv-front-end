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
  Body1,
  Caption1,
  Divider,
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
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  CalendarLtr24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
  Notebook24Filled,
} from "@fluentui/react-icons";
import { MeetingSummary, Account } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getMeetingSummaries,
  createMeetingSummary,
  updateMeetingSummary,
  deleteMeetingSummary,
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
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    ...shorthands.gap("16px"),
  },
  summaryCard: {
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
    transition: "box-shadow 0.15s ease, transform 0.15s ease",
    ":hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  cardMeta: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("16px"),
    marginTop: "12px",
    color: tokens.colorNeutralForeground3,
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
    setViewingSummary(summary);
    setViewDialogOpen(true);
  };

  const openEdit = (summary: MeetingSummary) => {
    setViewDialogOpen(false);
    setViewingSummary(null);
    setEditingId(summary.tdvsp_meetingsummaryid ?? null);
    setFormData({
      tdvsp_name: summary.tdvsp_name,
      tdvsp_date: summary.tdvsp_date ? summary.tdvsp_date.split("T")[0] : "",
      tdvsp_summary: summary.tdvsp_summary ?? "",
      accountId: summary.tdvsp_Account?.accountid ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
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
      if (editingId) {
        await updateMeetingSummary(editingId, payload);
      } else {
        await createMeetingSummary(payload);
      }
      setDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      loadSummaries();
    } catch (err) {
      console.error("Failed to save meeting summary:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMeetingSummary(id);
      loadSummaries();
    } catch (err) {
      console.error("Failed to delete meeting summary:", err);
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

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search meeting summaries..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Meeting Summary
          </Button>
          <DialogSurface style={{ maxWidth: "700px", width: "700px" }}>
            <DialogBody>
              <DialogTitle>{editingId ? "Edit Meeting Summary" : "New Meeting Summary"}</DialogTitle>
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
                <Button appearance="primary" onClick={handleSave}>
                  Save
                </Button>
              </DialogActions>
            </DialogBody>
          </DialogSurface>
        </Dialog>
      </div>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Spinner label="Loading meeting summaries..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Notebook24Filled style={{ fontSize: 48, color: "#0078d4", marginBottom: 16 }} />
          <Subtitle1>No meeting summaries found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first meeting summary to start tracking.
          </Caption1>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((summary) => (
            <Card key={summary.tdvsp_meetingsummaryid} className={styles.summaryCard}>
              <div className={styles.cardHeader}>
                <Subtitle1
                  block
                  className={styles.nameLink}
                  onClick={() => openView(summary)}
                >
                  {summary.tdvsp_name}
                </Subtitle1>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                    title="Edit"
                    onClick={() => openEdit(summary)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                    title="Delete"
                    onClick={() =>
                      summary.tdvsp_meetingsummaryid && handleDelete(summary.tdvsp_meetingsummaryid)
                    }
                  />
                </div>
              </div>
              {summary.tdvsp_summary && (
                <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                  {summary.tdvsp_summary.length > 150
                    ? summary.tdvsp_summary.substring(0, 150) + "..."
                    : summary.tdvsp_summary}
                </Body1>
              )}
              <Divider style={{ margin: "12px 0" }} />
              <div className={styles.cardMeta}>
                {summary.tdvsp_date && (
                  <div className={styles.metaItem}>
                    <CalendarLtr24Regular style={{ fontSize: 16 }} />
                    <Caption1>{formatDate(summary.tdvsp_date)}</Caption1>
                  </div>
                )}
                {summary.tdvsp_Account?.name && (
                  <Caption1>{summary.tdvsp_Account.name}</Caption1>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(_, d) => setViewDialogOpen(d.open)}>
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
              Meeting Summary Details
            </DialogTitle>
            <DialogContent>
              {viewingSummary && (
                <>
                  <div className={styles.viewField}>
                    <Label>Name</Label>
                    <Text block size={400} weight="semibold">
                      {viewingSummary.tdvsp_name}
                    </Text>
                  </div>
                  <div className={styles.viewGrid}>
                    <div className={styles.viewField}>
                      <Label>Date</Label>
                      <Text block size={400}>
                        {viewingSummary.tdvsp_date ? formatDate(viewingSummary.tdvsp_date) : "--"}
                      </Text>
                    </div>
                    <div className={styles.viewField}>
                      <Label>Account</Label>
                      <Text block size={400}>
                        {viewingSummary.tdvsp_Account?.name || "--"}
                      </Text>
                    </div>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Summary</Label>
                    <div className={styles.summaryText}>
                      <Text size={400}>
                        {viewingSummary.tdvsp_summary || "--"}
                      </Text>
                    </div>
                  </div>
                </>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                appearance="primary"
                icon={<Edit24Regular />}
                onClick={() => viewingSummary && openEdit(viewingSummary)}
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
