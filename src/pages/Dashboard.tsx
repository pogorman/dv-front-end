import React, { useEffect, useState } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Card,
  Text,
  Badge,
  Subtitle1,
  Body1,
  Caption1,
  Divider,
} from "@fluentui/react-components";
import {
  Building24Filled,
  ContactCard24Filled,
  Lightbulb24Filled,
  TaskListSquareLtr24Filled,
  Warning24Filled,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { ActionItem, Account, Customer, Idea, ideaCategoryLabels } from "../types";
import { getActionItems, getAccounts, getCustomers, getIdeas } from "../services/dataverseService";
import { formatDate } from "../utils/formatDate";

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
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [contacts, setContacts] = useState<Customer[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  useEffect(() => {
    getAccounts().then(setAccounts).catch(console.error);
    getCustomers().then(setContacts).catch(console.error);
    getIdeas().then(setIdeas).catch(console.error);
    getActionItems().then(setActionItems).catch(console.error);
  }, []);

  const overdueTasks = actionItems.filter(
    (t) => t.tdvsp_date && new Date(t.tdvsp_date) < new Date()
  );

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
        <Card className={styles.statCard} onClick={() => navigate("/accounts")}>
          <div className={styles.statHeader}>
            <Caption1>Accounts</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#e8f0fe" }}
            >
              <Building24Filled style={{ color: "#0078d4" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#0078d4" }}>
            {accounts.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Total accounts
          </Caption1>
        </Card>

        <Card className={styles.statCard} onClick={() => navigate("/contacts")}>
          <div className={styles.statHeader}>
            <Caption1>Contacts</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#e8e0f0" }}
            >
              <ContactCard24Filled style={{ color: "#7c3aed" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#7c3aed" }}>
            {contacts.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Total contacts
          </Caption1>
        </Card>

        <Card className={styles.statCard} onClick={() => navigate("/ideas")}>
          <div className={styles.statHeader}>
            <Caption1>Ideas</Caption1>
            <div
              className={styles.statIconWrap}
              style={{ backgroundColor: "#fef3e2" }}
            >
              <Lightbulb24Filled style={{ color: "#d48000" }} />
            </div>
          </div>
          <div className={styles.statNumber} style={{ color: "#d48000" }}>
            {ideas.length}
          </div>
          <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
            Total ideas
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
            {actionItems.length}
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
          <Subtitle1 style={{ marginBottom: 16 }}>Recent Ideas</Subtitle1>
          {ideas.length === 0 ? (
            <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
              No ideas yet
            </Body1>
          ) : (
            ideas.slice(0, 4).map((idea, i) => (
              <React.Fragment key={idea.tdvsp_ideaid}>
                {i > 0 && <Divider />}
                <div className={styles.listItem}>
                  <div>
                    <Text weight="semibold" block>
                      {idea.tdvsp_name}
                    </Text>
                    <Caption1
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      {idea.tdvsp_category
                        ? ideaCategoryLabels[idea.tdvsp_category]
                        : ""}
                      {idea.tdvsp_Account?.name &&
                        `${idea.tdvsp_category ? " · " : ""}${idea.tdvsp_Account.name}`}
                    </Caption1>
                  </div>
                  {idea.tdvsp_category && (
                    <Badge appearance="outline" color="informative">
                      {ideaCategoryLabels[idea.tdvsp_category]}
                    </Badge>
                  )}
                </div>
              </React.Fragment>
            ))
          )}
        </Card>

        <Card className={styles.sectionCard}>
          <Subtitle1 style={{ marginBottom: 16 }}>Action Items</Subtitle1>
          {actionItems.length === 0 ? (
            <Body1 style={{ color: tokens.colorNeutralForeground3 }}>
              No action items
            </Body1>
          ) : (
            actionItems.slice(0, 4).map((t, i) => (
              <React.Fragment key={t.tdvsp_actionitemid}>
                {i > 0 && <Divider />}
                <div className={styles.listItem}>
                  <div>
                    <Text weight="semibold" block>
                      {t.tdvsp_name}
                    </Text>
                    <Caption1
                      style={{ color: tokens.colorNeutralForeground3 }}
                    >
                      {t.tdvsp_date && `Due: ${formatDate(t.tdvsp_date)}`}
                      {t.tdvsp_Customer?.name && ` · ${t.tdvsp_Customer.name}`}
                    </Caption1>
                  </div>
                  {t.tdvsp_date && (
                    <Badge
                      appearance="filled"
                      color={
                        new Date(t.tdvsp_date) < new Date()
                          ? "danger"
                          : "informative"
                      }
                    >
                      {new Date(t.tdvsp_date) < new Date() ? "Overdue" : "Upcoming"}
                    </Badge>
                  )}
                </div>
              </React.Fragment>
            ))
          )}
        </Card>
      </div>
    </div>
  );
};
