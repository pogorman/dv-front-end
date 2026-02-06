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
  Star24Filled,
  CalendarLtr24Regular,
  Edit24Regular,
  Delete24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import { HighValueActivity, Account } from "../types";
import { formatDate } from "../utils/formatDate";
import {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity,
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
  activityCard: {
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

export const Activities: React.FC = () => {
  const styles = useStyles();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activities, setActivities] = useState<HighValueActivity[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingActivity, setViewingActivity] = useState<HighValueActivity | null>(null);

  const loadActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getActivities();
      setActivities(data);
    } catch (err) {
      console.error("Failed to load activities:", err);
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
    loadActivities();
    loadAccounts();
  }, [loadActivities, loadAccounts]);

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

  const openView = (activity: HighValueActivity) => {
    setViewingActivity(activity);
    setViewDialogOpen(true);
  };

  const openEdit = (activity: HighValueActivity) => {
    setViewDialogOpen(false);
    setViewingActivity(null);
    setEditingId(activity.tdvsp_hvaid ?? null);
    setFormData({
      tdvsp_name: activity.tdvsp_name,
      tdvsp_description: activity.tdvsp_description,
      tdvsp_date: activity.tdvsp_date ? activity.tdvsp_date.split("T")[0] : "",
      customerAccountId: activity.tdvsp_Customer?.accountid ?? "",
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
        await updateActivity(editingId, payload);
      } else {
        await createActivity(payload);
      }
      setDialogOpen(false);
      setFormData(emptyForm);
      setEditingId(null);
      loadActivities();
    } catch (err) {
      console.error("Failed to save activity:", err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteActivity(id);
      loadActivities();
    } catch (err) {
      console.error("Failed to delete activity:", err);
    }
  };

  const filtered = activities.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.tdvsp_name?.toLowerCase().includes(q) ||
      a.tdvsp_description?.toLowerCase().includes(q) ||
      a.tdvsp_Customer?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <Button appearance="primary" icon={<Add24Regular />} onClick={openNew}>
            New Activity
          </Button>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>{editingId ? "Edit Activity" : "New High-Value Activity"}</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Name</Label>
                    <Input
                      value={formData.tdvsp_name}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_name: d.value })
                      }
                      placeholder="Brief title for this activity"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.tdvsp_description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, tdvsp_description: d.value })
                      }
                      placeholder="Details about the activity..."
                      rows={3}
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
          <Spinner label="Loading activities..." />
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.emptyState}>
          <Star24Filled style={{ fontSize: 48, color: "#d48000", marginBottom: 16 }} />
          <Subtitle1>No activities found</Subtitle1>
          <Caption1 style={{ marginTop: 8 }}>
            Create your first high-value activity to start tracking.
          </Caption1>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((activity) => (
            <Card key={activity.tdvsp_hvaid} className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <Subtitle1
                  block
                  className={styles.nameLink}
                  onClick={() => openView(activity)}
                >
                  {activity.tdvsp_name}
                </Subtitle1>
                <div style={{ display: "flex", gap: 4 }}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                    title="Edit"
                    onClick={() => openEdit(activity)}
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                    title="Delete"
                    onClick={() =>
                      activity.tdvsp_hvaid && handleDelete(activity.tdvsp_hvaid)
                    }
                  />
                </div>
              </div>
              {activity.tdvsp_description && (
                <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                  {activity.tdvsp_description}
                </Body1>
              )}
              <Divider style={{ margin: "12px 0" }} />
              <div className={styles.cardMeta}>
                {activity.tdvsp_date && (
                  <div className={styles.metaItem}>
                    <CalendarLtr24Regular style={{ fontSize: 16 }} />
                    <Caption1>{formatDate(activity.tdvsp_date)}</Caption1>
                  </div>
                )}
                {activity.tdvsp_Customer?.name && (
                  <Caption1>{activity.tdvsp_Customer.name}</Caption1>
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
              Activity Details
            </DialogTitle>
            <DialogContent>
              {viewingActivity && (
                <>
                  <div className={styles.viewField}>
                    <Label>Name</Label>
                    <Text block size={400} weight="semibold">
                      {viewingActivity.tdvsp_name}
                    </Text>
                  </div>
                  <div className={styles.viewField}>
                    <Label>Description</Label>
                    <Text block size={400}>
                      {viewingActivity.tdvsp_description || "--"}
                    </Text>
                  </div>
                  <div className={styles.viewGrid}>
                    <div className={styles.viewField}>
                      <Label>Date</Label>
                      <Text block size={400}>
                        {viewingActivity.tdvsp_date ? formatDate(viewingActivity.tdvsp_date) : "--"}
                      </Text>
                    </div>
                    <div className={styles.viewField}>
                      <Label>Customer</Label>
                      <Text block size={400}>
                        {viewingActivity.tdvsp_Customer?.name || "--"}
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
                onClick={() => viewingActivity && openEdit(viewingActivity)}
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
