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
  Dropdown,
  Option,
  Textarea,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  Trophy24Filled,
  CalendarLtr24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { Impact, Account } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getImpacts,
  createImpact,
  updateImpact,
  deleteImpact,
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
  impactCard: {
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
});

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
    setViewingImpact(impact);
    setViewDialogOpen(true);
  };

  const openEdit = (impact: Impact) => {
    setViewDialogOpen(false);
    setViewingImpact(null);
    setEditingId(impact.tdvsp_impactid ?? null);
    setFormData({
      tdvsp_name: impact.tdvsp_name,
      tdvsp_description: impact.tdvsp_description,
      tdvsp_date: impact.tdvsp_date ? impact.tdvsp_date.split("T")[0] : "",
      customerAccountId: impact.tdvsp_Customer?.accountid ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
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
      if (editingId) {
        await updateImpact(editingId, payload);
      } else {
        await createImpact(payload);
      }
      setDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      loadImpacts();
    } catch (err) {
      console.error("Failed to save impact:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteImpact(id);
      loadImpacts();
    } catch (err) {
      console.error("Failed to delete impact:", err);
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

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search impacts..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Impact
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{editingId ? "Edit Impact" : "New Impact"}</DialogTitle>
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
          <Spinner label="Loading impacts..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Trophy24Filled style={{ fontSize: 48, color: "#8764b8", marginBottom: 16 }} />
          <Subtitle1>No impacts found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first impact to start tracking.
          </Caption1>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((impact) => (
            <Card key={impact.tdvsp_impactid} className={styles.impactCard}>
              <div className={styles.cardHeader}>
                <Subtitle1
                  block
                  className={styles.nameLink}
                  onClick={() => openView(impact)}
                >
                  {impact.tdvsp_name}
                </Subtitle1>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                    title="Edit"
                    onClick={() => openEdit(impact)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                    title="Delete"
                    onClick={() =>
                      impact.tdvsp_impactid && handleDelete(impact.tdvsp_impactid)
                    }
                  />
                </div>
              </div>
              {impact.tdvsp_description && (
                <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                  {impact.tdvsp_description}
                </Body1>
              )}
              <Divider style={{ margin: "12px 0" }} />
              <div className={styles.cardMeta}>
                {impact.tdvsp_date && (
                  <div className={styles.metaItem}>
                    <CalendarLtr24Regular style={{ fontSize: 16 }} />
                    <Caption1>{formatDate(impact.tdvsp_date)}</Caption1>
                  </div>
                )}
                {impact.tdvsp_Customer?.name && (
                  <Caption1>{impact.tdvsp_Customer.name}</Caption1>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

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
              Impact Details
            </DialogTitle>
            <DialogContent>
              {viewingImpact && (
                <>
                  <div className={styles.viewField}>
                    <Label>Name</Label>
                    <Text block size={400} weight="semibold">
                      {viewingImpact.tdvsp_name}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Description</Label>
                    <Text block size={400}>
                      {viewingImpact.tdvsp_description || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewGrid}>
                    <div className={styles.viewField}>
                      <Label>Date</Label>
                      <Text block size={400}>
                        {viewingImpact.tdvsp_date ? formatDate(viewingImpact.tdvsp_date) : "--"}
                      </Text>
                    </div>
                    <div className={styles.viewField}>
                      <Label>Customer</Label>
                      <Text block size={400}>
                        {viewingImpact.tdvsp_Customer?.name || "--"}
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
                onClick={() => viewingImpact && openEdit(viewingImpact)}
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
