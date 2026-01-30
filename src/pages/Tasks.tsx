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
  Tab,
  TabList,
  Checkbox,
} from "@fluentui/react-components";
import {
  Add24Regular,
  Search24Regular,
  TaskListSquareLtr24Filled,
  CalendarLtr24Regular,
  Edit24Regular,
  Delete24Regular,
  CheckmarkCircle24Regular,
} from "@fluentui/react-icons";
import {
  TaskItem,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from "../types";
import { getTasks, createTask, updateTask } from "../services/dataverseService";

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
  taskActions: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("4px"),
    flexShrink: 0,
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
  tabBar: {
    ...shorthands.padding("0px", "20px"),
    backgroundColor: tokens.colorNeutralBackground1,
  },
  completedText: {
    textDecoration: "line-through",
    color: tokens.colorNeutralForeground3,
  },
});

const emptyTask: Omit<TaskItem, "id"> = {
  title: "",
  description: "",
  duedate: "",
  priority: "Medium",
  status: "Not Started",
  assignedto: "",
  relatedcustomer: "",
};

type FilterTab = "all" | "active" | "completed";

export const Tasks: React.FC = () => {
  const styles = useStyles();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState(emptyTask);
  const [filterTab, setFilterTab] = useState<FilterTab>("active");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTasks();
      setTasks(data);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSave = async () => {
    try {
      await createTask(formData);
      setDialogOpen(false);
      setFormData(emptyTask);
      loadTasks();
    } catch (err) {
      console.error("Failed to save task:", err);
    }
  };

  const handleToggleComplete = async (task: TaskItem) => {
    const newStatus =
      task.status === "Completed" ? "Not Started" : "Completed";
    try {
      await updateTask(task.id!, { status: newStatus });
      setTasks((prev) =>
        prev.map((t) =>
          t.id === task.id ? { ...t, status: newStatus as TaskItem["status"] } : t
        )
      );
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const filtered = tasks
    .filter((t) => {
      if (filterTab === "active") return t.status !== "Completed";
      if (filterTab === "completed") return t.status === "Completed";
      return true;
    })
    .filter((t) => {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        (t.relatedcustomer?.toLowerCase().includes(q) ?? false)
      );
    });

  const priorityColor = (p: string) => {
    switch (p) {
      case "High":
        return "danger" as const;
      case "Medium":
        return "warning" as const;
      default:
        return "success" as const;
    }
  };

  const isOverdue = (task: TaskItem) =>
    task.status !== "Completed" && new Date(task.duedate) < new Date();

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <Input
          className={styles.searchBox}
          contentBefore={<Search24Regular />}
          placeholder="Search tasks..."
          value={searchQuery}
          onChange={(_, d) => setSearchQuery(d.value)}
        />
        <Dialog open={dialogOpen} onOpenChange={(_, d) => setDialogOpen(d.open)}>
          <DialogTrigger disableButtonEnhancement>
            <Button appearance="primary" icon={<Add24Regular />}>
              New Task
            </Button>
          </DialogTrigger>
          <DialogSurface>
            <DialogBody>
              <DialogTitle>New Task</DialogTitle>
              <DialogContent>
                <div className={styles.formGrid}>
                  <div className={styles.formFieldFull}>
                    <Label required>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(_, d) =>
                        setFormData({ ...formData, title: d.value })
                      }
                      placeholder="What needs to be done?"
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Description</Label>
                    <Textarea
                      value={formData.description}
                      onChange={(_, d) =>
                        setFormData({ ...formData, description: d.value })
                      }
                      placeholder="Additional details..."
                      rows={3}
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label required>Due Date</Label>
                    <Input
                      type="date"
                      value={formData.duedate}
                      onChange={(_, d) =>
                        setFormData({ ...formData, duedate: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formField}>
                    <Label>Priority</Label>
                    <Dropdown
                      value={formData.priority}
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          priority: (d.optionValue as TaskItem["priority"]) ?? "Medium",
                        })
                      }
                    >
                      {TASK_PRIORITIES.map((p) => (
                        <Option key={p} value={p}>
                          {p}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Status</Label>
                    <Dropdown
                      value={formData.status}
                      onOptionSelect={(_, d) =>
                        setFormData({
                          ...formData,
                          status: (d.optionValue as TaskItem["status"]) ?? "Not Started",
                        })
                      }
                    >
                      {TASK_STATUSES.map((s) => (
                        <Option key={s} value={s}>
                          {s}
                        </Option>
                      ))}
                    </Dropdown>
                  </div>
                  <div className={styles.formField}>
                    <Label>Assigned To</Label>
                    <Input
                      value={formData.assignedto}
                      onChange={(_, d) =>
                        setFormData({ ...formData, assignedto: d.value })
                      }
                    />
                  </div>
                  <div className={styles.formFieldFull}>
                    <Label>Related Customer</Label>
                    <Input
                      value={formData.relatedcustomer}
                      onChange={(_, d) =>
                        setFormData({ ...formData, relatedcustomer: d.value })
                      }
                      placeholder="Optional: link to a customer"
                    />
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

      <Card className={styles.card}>
        <div className={styles.tabBar}>
          <TabList
            selectedValue={filterTab}
            onTabSelect={(_, d) => setFilterTab(d.value as FilterTab)}
          >
            <Tab value="active">
              Active ({tasks.filter((t) => t.status !== "Completed").length})
            </Tab>
            <Tab value="completed">
              Completed ({tasks.filter((t) => t.status === "Completed").length})
            </Tab>
            <Tab value="all">All ({tasks.length})</Tab>
          </TabList>
        </div>
        <Divider />

        {loading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Spinner label="Loading tasks..." />
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.emptyState}>
            <TaskListSquareLtr24Filled
              style={{ fontSize: 48, color: "#107c10", marginBottom: 16 }}
            />
            <Subtitle1>
              {filterTab === "completed"
                ? "No completed tasks"
                : "No tasks found"}
            </Subtitle1>
            <Caption1 style={{ marginTop: 8 }}>
              {filterTab === "active"
                ? "You're all caught up! Create a new task to get started."
                : "Create your first task to start tracking action items."}
            </Caption1>
          </div>
        ) : (
          filtered.map((task, i) => (
            <React.Fragment key={task.id}>
              {i > 0 && <Divider />}
              <div className={styles.taskRow}>
                <Checkbox
                  checked={task.status === "Completed"}
                  onChange={() => handleToggleComplete(task)}
                  shape="circular"
                />
                <div className={styles.taskContent}>
                  <Text
                    weight="semibold"
                    className={
                      task.status === "Completed"
                        ? styles.completedText
                        : undefined
                    }
                  >
                    {task.title}
                  </Text>
                  {task.description && (
                    <Caption1
                      block
                      style={{
                        color: tokens.colorNeutralForeground3,
                        marginTop: 2,
                      }}
                    >
                      {task.description}
                    </Caption1>
                  )}
                  <div className={styles.taskMeta}>
                    <div className={styles.metaItem}>
                      <CalendarLtr24Regular style={{ fontSize: 14 }} />
                      <Caption1
                        style={{
                          color: isOverdue(task)
                            ? tokens.colorPaletteRedForeground1
                            : tokens.colorNeutralForeground3,
                          fontWeight: isOverdue(task) ? "600" : "400",
                        }}
                      >
                        {task.duedate}
                        {isOverdue(task) && " (Overdue)"}
                      </Caption1>
                    </div>
                    {task.relatedcustomer && (
                      <Caption1
                        style={{ color: tokens.colorNeutralForeground3 }}
                      >
                        {task.relatedcustomer}
                      </Caption1>
                    )}
                  </div>
                </div>
                <div className={styles.taskActions}>
                  <Badge
                    appearance="filled"
                    color={priorityColor(task.priority)}
                    style={{ marginRight: 8 }}
                  >
                    {task.priority}
                  </Badge>
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
            </React.Fragment>
          ))
        )}
      </Card>
    </div>
  );
};
