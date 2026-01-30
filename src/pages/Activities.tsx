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
  Badge,
  Divider,
  Dialog,
  DialogTrigger,
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
} from "@fluentui/react-icons";
import { HighValueActivity, ACTIVITY_TYPES } from "../types";
import {
  getActivities,
  createActivity,
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
  actions: {
    display: "flex",
    ...shorthands.gap("4px"),
  },
});

const emptyActivity: Omit<HighValueActivity, "id"> = {
  activitytype: "",
  subject: "",
  description: "",
  customername: "",
  scheduleddate: "",
  status: "Scheduled",
};

export const Activities: React.FC = () => {
  const styles = useStyles();
  const [activities, setActivities] = useState<HighValueActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyActivity);

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

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const handleSave = async () => {
    try {
      await createActivity(formData);
      setDialogOpen(false);
      setFormData(emptyActivity);
      loadActivities();
    } catch (err) {
      console.error("Failed to save activity:", err);
    }
  };

  const filtered = activities.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.subject.toLowerCase().includes(q) ||
      a.customername.toLowerCase().includes(q) ||
      a.activitytype.toLowerCase().includes(q)
    );
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success" as const;
      case "Cancelled":
        return "danger" as const;
      default:
        return "informative" as const;
    }
  };

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
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>
              New Activity
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New High-Value Activity</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <Label required>Activity Type</Label>
                    <Dropdown
                      placeholder="Select type"
                      value={formData.activitytype}
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          activitytype: d.optionValue ?? "",
                        })
                      }
                    >
                      {ACTIVITY_TYPES.map((t) => (
                        <Option key={t} value={t}>
                          {t}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label required>Customer Name</Label>
                    <Input
                      value={formData.customername}
                      onChange={(_, d) =>
                        setFormData({ ...formData, customername: d.value })
                      }
                      placeholder="e.g. Contoso Ltd"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label required>Subject</Label>
                    <Input
                      value={formData.subject}
                      onChange={(_, d) =>
                        setFormData({ ...formData, subject: d.value })
                      }
                      placeholder="Brief title for this activity"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, description: d.value })
                      }
                      placeholder="Details about the activity..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label required>Scheduled Date</Label>
                    <Input
                      type="date"
                      value={formData.scheduleddate}
                      onChange={(_, d) =>
                        setFormData({ ...formData, scheduleddate: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Status</Label>
                    <Dropdown
                      value={formData.status}
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          status: d.optionValue ?? "Scheduled",
                        })
                      }
                    >
                      <Option value="Scheduled">Scheduled</Option>
                      <Option value="Completed">Completed</Option>
                      <Option value="Cancelled">Cancelled</Option>
                    </Dropdown>
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
            <Card key={activity.id} className={styles.activityCard}>
              <div className={styles.cardHeader}>
                <div>
                  <Badge
                    appearance="tint"
                    color="brand"
                    style={{ marginBottom: 8 }}
                  >
                    {activity.activitytype}
                  </Badge>
                  <Subtitle1 block>{activity.subject}</Subtitle1>
                </div>
                <Badge appearance="filled" color={statusColor(activity.status)}>
                  {activity.status}
                </Badge>
              </div>
              <Body1 style={{ color: tokens.colorNeutralForeground2 }}>
                {activity.description}
              </Body1>
              <Divider style={{ margin: "12px 0" }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <div className={styles.cardMeta}>
                  <div className={styles.metaItem}>
                    <CalendarLtr24Regular style={{ fontSize: 16 }} />
                    <Caption1>{activity.scheduleddate}</Caption1>
                  </div>
                  <Caption1>{activity.customername}</Caption1>
                </div>
                <div className={styles.actions}>
                  <Button
                    appearance="subtle"
                    icon={<Edit24Regular />}
                    size="small"
                  />
                  <Button
                    appearance="subtle"
                    icon={<Delete24Regular />}
                    size="small"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
