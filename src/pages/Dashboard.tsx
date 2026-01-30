import React, { useEffect, useState } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  CardHeader,
  Text,
  Badge,
  Subtitle1,
  Body1,
  Caption1,
  Divider,
} from "@fluentui/react-components";
import {
  People24Filled,
  Star24Filled,
  TaskListSquareLtr24Filled,
  Warning24Filled,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { HighValueActivity, TaskItem } from "../types";
import { getActivities, getTasks } from "../services/dataverseService";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("24px"),
  },
  welcomeCard: {
    ...shorthands.padding("32px"),
    background: "linear-gradient(135deg, #0078d4 0%, #106ebe 50%, #005a9e 100%)",
    color: "white",
    ...shorthands.borderRadius("12px"),
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    ...shorthands.gap("16px"),
  },
  statCard: {
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
    cursor: "pointer",
    transition: "box-shadow 0.2s ease, transform 0.2s ease",
    ":hover": {
      boxShadow: tokens.shadow8,
      transform: "translateY(-2px)",
    },
  },
  statHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
  },
  statIconWrap: {
    width: "40px",
    height: "40px",
    ...shorthands.borderRadius("10px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statNumber: {
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1",
    marginBottom: "4px",
  },
  sectionGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("16px"),
    "@media (max-width: 900px)": {
      gridTemplateColumns: "1fr",
    },
  },
  sectionCard: {
    ...shorthands.padding("20px"),
    ...shorthands.borderRadius("12px"),
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("10px", "0px"),
  },
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [activities, setActivities] = useState<HighValueActivity[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);

  useEffect(() => {
    getActivities().then(setActivities);
    getTasks().then(setTasks);
  }, []);

  const upcomingActivities = activities
    .filter((a) => a.status !== "Completed")
    .slice(0, 4);
  const overdueTasks = tasks.filter(
    (t) => t.status !== "Completed" && new Date(t.duedate) < new Date()
  );
  const pendingTasks = tasks.filter((t) => t.status !== "Completed");

  return (
    <div className={styles.container}>
      {/* Welcome Banner */}
      <div className={styles.welcomeCard}>
        <Text
          size={700}
          weight="bold"
          style={{ color: "white", display: "block", marginBottom: 8 }}
        >
          Welcome back
        </Text>
        <Text size={400} style={{ color: "rgba(255,255,255,0.85)" }}>
          Here's an overview of your customers, activities, and tasks.
        </Text>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard} onClick={() => navigate("/customers")}>
          <div className={styles.statHeader}>
            <Caption1>Customers</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#e8f0fe" }}
            >
              <People24Filled style={{ color: "#0078d4" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#0078d4" }}>
            --
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Connect Dataverse to see count
          </Caption1>
        </Card>

        <Card className={styles.statCard} onClick={() => navigate("/activities")}>
          <div className={styles.statHeader}>
            <Caption1>Upcoming Activities</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#fef3e2" }}
            >
              <Star24Filled style={{ color: "#d48000" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#d48000" }}>
            {upcomingActivities.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Scheduled
          </Caption1>
        </Card>

        <Card className={styles.statCard} onClick={() => navigate("/tasks")}>
          <div className={styles.statHeader}>
            <Caption1>Open Tasks</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#e6f4ea" }}
            >
              <TaskListSquareLtr24Filled style={{ color: "#107c10" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#107c10" }}>
            {pendingTasks.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Action items pending
          </Caption1>
        </Card>

        <Card className={styles.statCard} onClick={() => navigate("/tasks")}>
          <div className={styles.statHeader}>
            <Caption1>Overdue</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#fde7e9" }}
            >
              <Warning24Filled style={{ color: "#d13438" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#d13438" }}>
            {overdueTasks.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Need attention
          </Caption1>
        </Card>
      </div>

      {/* Detail Sections */}
      <div className={styles.sectionGrid}>
        <Card className={styles.sectionCard}>
          <Subtitle1 style={{ marginBottom: 16 }}>
            Upcoming Activities
          </Subtitle1>
          {upcomingActivities.length === 0 ? (
            <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
              No upcoming activities
            </Body1>
          ) : (
            upcomingActivities.map((a, i) => (
              <React.Fragment key={a.id}>
                {i > 0 && <Divider />}
                <div className={styles.listItem}>
                  <div>
                    <Text weight="semibold" block>
                      {a.subject}
                    </Text>
                    <Caption1
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      {a.activitytype} &middot; {a.customername}
                    </Caption1>
                  </div>
                  <Badge appearance="outline" color="informative">
                    {a.scheduleddate}
                  </Badge>
                </div>
              </React.Fragment>
            ))
          )}
        </Card>

        <Card className={styles.sectionCard}>
          <Subtitle1 style={{ marginBottom: 16 }}>Priority Tasks</Subtitle1>
          {pendingTasks.length === 0 ? (
            <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
              No open tasks
            </Body1>
          ) : (
            pendingTasks.slice(0, 4).map((t, i) => (
              <React.Fragment key={t.id}>
                {i > 0 && <Divider />}
                <div className={styles.listItem}>
                  <div>
                    <Text weight="semibold" block>
                      {t.title}
                    </Text>
                    <Caption1
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      Due: {t.duedate}
                      {t.relatedcustomer && ` · ${t.relatedcustomer}`}
                    </Caption1>
                  </div>
                  <Badge
                    appearance="filled"
                    color={
                      t.priority === "High"
                        ? "danger"
                        : t.priority === "Medium"
                          ? "warning"
                          : "success"
                    }
                  >
                    {t.priority}
                  </Badge>
                </div>
              </React.Fragment>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};
