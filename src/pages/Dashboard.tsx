import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  makeStyles,
  tokens,
  shorthands,
  Text,
  Body1,
  Caption1,
  Button,
  Spinner,
} from "@fluentui/react-components";
import {
  CheckboxChecked24Filled,
  CheckboxChecked20Regular,
  Home20Regular,
  HatGraduation20Regular,
  LightbulbFilament20Regular,
  PeopleTeam20Regular,
  Building20Regular,
  Person20Regular,
  Briefcase20Regular,
  Flash20Regular,
  Calendar24Regular,
  ArrowUp24Regular,
  Clock24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import { ActionItem, TaskStatus, TaskPriority, TaskType } from "../types";
import { getActionItems } from "../services/dataverseService";

const statusConfig: Record<number, { label: string; color: string; order: number }> = {
  468510000: { label: "Recognized", color: "#9ca3af", order: 0 },
  468510001: { label: "In Progress", color: "#4a9eff", order: 1 },
  468510002: { label: "Pending Comm.", color: "#f59e0b", order: 2 },
  468510003: { label: "On Hold", color: "#eab308", order: 3 },
  468510004: { label: "Wrapping Up", color: "#22d3ee", order: 4 },
  468510005: { label: "Complete", color: "#3dd68c", order: 5 },
};

const priorityOrder = [468510000, 468510001, 468510002, 468510003];
const priorityConfig: Record<number, { label: string; color: string }> = {
  468510000: { label: "Low", color: "#3dd68c" },
  468510001: { label: "Eh", color: "#9ca3af" },
  468510002: { label: "Top Priority", color: "#f87171" },
  468510003: { label: "High", color: "#4a9eff" },
};

const typeOrder = [468510000, 468510001, 468510002];
const typeConfig: Record<number, { label: string; color: string; icon: React.ReactNode }> = {
  468510000: { label: "Personal", color: "#4a9eff", icon: <Home20Regular /> },
  468510001: { label: "Work", color: "#f87171", icon: <Briefcase20Regular /> },
  468510002: { label: "Learning", color: "#a78bfa", icon: <HatGraduation20Regular /> },
};

const accountColors = ["#4a9eff", "#3dd68c", "#f59e0b", "#a78bfa", "#f87171", "#22d3ee", "#e879f9", "#fb923c"];

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
    marginTop: "-10px",
    height: "calc(100vh - 68px)",
    overflowY: "auto" as const,
    ...shorthands.padding("0", "4px", "20px"),
  },
  quickBar: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("6px"),
    ...shorthands.padding("8px", "4px"),
    flexShrink: 0,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    marginBottom: "4px",
  },
  qcLabel: {
    fontSize: "10px",
    fontWeight: "600",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    letterSpacing: "1.5px",
    marginRight: "6px",
    whiteSpace: "nowrap" as const,
  },
  qcBtn: {
    ...shorthands.borderRadius("6px"),
    fontSize: "11px",
    fontWeight: "500",
    fontFamily: tokens.fontFamilyMonospace,
    minHeight: "28px",
    height: "28px",
    ...shorthands.padding("0px", "10px"),
    border: "1px solid transparent",
    transition: "all 0.15s ease",
    ":hover": {
      filter: "brightness(1.3)",
      transform: "translateY(-1px)",
    },
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("0", "4px"),
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    ...shorthands.gap("12px"),
  },
  kpiCard: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("4px"),
    ...shorthands.padding("16px", "18px"),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("10px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    position: "relative" as const,
  },
  kpiIcon: {
    position: "absolute" as const,
    top: "14px",
    right: "14px",
    width: "36px",
    height: "36px",
    ...shorthands.borderRadius("10px"),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  kpiLabel: {
    fontSize: "10px",
    fontWeight: "600",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    letterSpacing: "1px",
  },
  kpiValue: {
    fontSize: "32px",
    fontWeight: "700",
    lineHeight: "1.1",
    color: tokens.colorNeutralForeground1,
  },
  kpiSub: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  chartsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    ...shorthands.gap("12px"),
  },
  chartCard: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("16px"),
    ...shorthands.padding("20px"),
    backgroundColor: tokens.colorNeutralBackground1,
    ...shorthands.borderRadius("10px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  chartTitle: {
    paddingLeft: "10px",
    borderLeftWidth: "3px",
    borderLeftStyle: "solid",
  },
  chartTitleText: {
    fontSize: "11px",
    fontWeight: "600",
    fontFamily: tokens.fontFamilyMonospace,
    letterSpacing: "1.5px",
    color: tokens.colorNeutralForeground2,
  },
  donutWrap: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("24px"),
  },
  legend: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("8px"),
    flexGrow: 1,
  },
  legendRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  legendDot: {
    width: "10px",
    height: "10px",
    ...shorthands.borderRadius("50%"),
    flexShrink: 0,
  },
  barRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    height: "32px",
  },
  barLabel: {
    width: "90px",
    fontSize: "12px",
    fontWeight: "500",
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
    whiteSpace: "nowrap" as const,
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  barTrack: {
    flexGrow: 1,
    height: "28px",
    ...shorthands.borderRadius("6px"),
    backgroundColor: tokens.colorNeutralBackground3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    ...shorthands.borderRadius("6px"),
    display: "flex",
    alignItems: "center",
    ...shorthands.padding("0", "0", "0", "8px"),
    transition: "width 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
    minWidth: "0px",
  },
  barNum: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#fff",
    textShadow: "0 1px 2px rgba(0,0,0,0.2)",
  },
  barCountR: {
    fontSize: "13px",
    fontWeight: "600",
    color: tokens.colorNeutralForeground2,
    width: "24px",
    textAlign: "right" as const,
    flexShrink: 0,
  },
  stackedBar: {
    display: "flex",
    height: "16px",
    ...shorthands.borderRadius("8px"),
    overflow: "hidden",
    marginBottom: "4px",
  },
  typeRow: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    height: "32px",
  },
  typeIcon: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  typeLabel: {
    width: "70px",
    fontSize: "12px",
    fontWeight: "500",
    color: tokens.colorNeutralForeground2,
    flexShrink: 0,
  },
  summaryLine: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...shorthands.padding("10px", "0", "0"),
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    marginTop: "4px",
  },
});

export const Dashboard: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActionItems()
      .then(setActionItems)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const total = actionItems.length;
    const complete = actionItems.filter((t) => t.tdvsp_taskstatus === (468510005 as TaskStatus)).length;
    const inProgress = actionItems.filter((t) => t.tdvsp_taskstatus === (468510001 as TaskStatus)).length;
    const highPriority = actionItems.filter(
      (t) => t.tdvsp_priority === (468510002 as TaskPriority) || t.tdvsp_priority === (468510003 as TaskPriority)
    ).length;
    const completionRate = total > 0 ? Math.round((complete / total) * 100) : 0;

    const statusMap = new Map<number, number>();
    actionItems.forEach((t) => {
      if (t.tdvsp_taskstatus != null) {
        statusMap.set(t.tdvsp_taskstatus, (statusMap.get(t.tdvsp_taskstatus) || 0) + 1);
      }
    });

    const priorityMap = new Map<number, number>();
    actionItems.forEach((t) => {
      if (t.tdvsp_priority != null) {
        priorityMap.set(t.tdvsp_priority, (priorityMap.get(t.tdvsp_priority) || 0) + 1);
      }
    });

    const typeMap = new Map<number, number>();
    actionItems.forEach((t) => {
      if (t.tdvsp_tasktype != null) {
        typeMap.set(t.tdvsp_tasktype, (typeMap.get(t.tdvsp_tasktype) || 0) + 1);
      }
    });

    const accountMap = new Map<string, number>();
    actionItems.forEach((t) => {
      const name = t.tdvsp_Customer?.name || "Unassigned";
      accountMap.set(name, (accountMap.get(name) || 0) + 1);
    });
    const accountCounts = Array.from(accountMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return { total, complete, inProgress, highPriority, completionRate, statusMap, priorityMap, typeMap, accountCounts };
  }, [actionItems]);

  const donutSegments = Array.from(stats.statusMap.entries())
    .filter(([s]) => statusConfig[s])
    .map(([status, count]) => ({ status, count }))
    .sort((a, b) => (statusConfig[a.status]?.order ?? 0) - (statusConfig[b.status]?.order ?? 0));
  const donutTotal = donutSegments.reduce((sum, s) => sum + s.count, 0);
  const circumference = 2 * Math.PI * 40;

  const maxPriority = Math.max(...priorityOrder.map((p) => stats.priorityMap.get(p) || 0), 1);
  const maxAccount = Math.max(...stats.accountCounts.map((a) => a.count), 1);

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh" }}>
        <Spinner size="large" label="Loading insights..." />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Quick Create */}
      <div className={styles.quickBar}>
        <span className={styles.qcLabel}>QUICK CREATE</span>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<CheckboxChecked20Regular />} onClick={() => navigate("/tasks?new=true")} style={{ backgroundColor: "rgba(248,113,113,0.12)", color: "#f87171", borderColor: "rgba(248,113,113,0.25)" }}>work</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<Home20Regular />} onClick={() => navigate("/personal?new=true")} style={{ backgroundColor: "rgba(34,211,238,0.12)", color: "#22d3ee", borderColor: "rgba(34,211,238,0.25)" }}>personal</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<HatGraduation20Regular />} onClick={() => navigate("/tasks?new=true")} style={{ backgroundColor: "rgba(167,139,250,0.12)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.25)" }}>learning</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<LightbulbFilament20Regular />} onClick={() => navigate("/ideas?new=true")} style={{ backgroundColor: "rgba(167,139,250,0.12)", color: "#a78bfa", borderColor: "rgba(167,139,250,0.25)" }}>idea</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<PeopleTeam20Regular />} onClick={() => navigate("/summaries?new=true")} style={{ backgroundColor: "rgba(251,146,60,0.12)", color: "#fb923c", borderColor: "rgba(251,146,60,0.25)" }}>meeting</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<Briefcase20Regular />} onClick={() => navigate("/projects?new=true")} style={{ backgroundColor: "rgba(232,121,249,0.12)", color: "#e879f9", borderColor: "rgba(232,121,249,0.25)" }}>project</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<Building20Regular />} onClick={() => navigate("/accounts?new=true")} style={{ backgroundColor: "rgba(61,214,140,0.12)", color: "#3dd68c", borderColor: "rgba(61,214,140,0.25)" }}>account</Button>
        <Button className={styles.qcBtn} size="small" appearance="subtle" icon={<Person20Regular />} onClick={() => navigate("/contacts?new=true")} style={{ backgroundColor: "rgba(34,211,238,0.12)", color: "#22d3ee", borderColor: "rgba(34,211,238,0.25)" }}>contact</Button>
      </div>

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <CheckboxChecked24Filled style={{ color: "#4a9eff", fontSize: "28px" }} />
        <div>
          <Text size={600} weight="bold">Action Items</Text>
          <Caption1 style={{ display: "block", color: tokens.colorNeutralForeground3, fontFamily: tokens.fontFamilyMonospace, letterSpacing: "0.5px" }}>
            insights at a glance
          </Caption1>
        </div>
      </div>

      {/* KPI Cards */}
      <div className={styles.kpiRow}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: "rgba(74,158,255,0.12)" }}>
            <Calendar24Regular style={{ color: "#4a9eff" }} />
          </div>
          <span className={styles.kpiLabel}>TOTAL ITEMS</span>
          <span className={styles.kpiValue}>{stats.total}</span>
          <span className={styles.kpiSub}>across all accounts</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: "rgba(61,214,140,0.12)" }}>
            <ArrowUp24Regular style={{ color: "#3dd68c" }} />
          </div>
          <span className={styles.kpiLabel}>COMPLETION RATE</span>
          <span className={styles.kpiValue}>{stats.completionRate}%</span>
          <span className={styles.kpiSub}>{stats.complete} of {stats.total} complete</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: "rgba(245,158,11,0.12)" }}>
            <Clock24Regular style={{ color: "#f59e0b" }} />
          </div>
          <span className={styles.kpiLabel}>IN PROGRESS</span>
          <span className={styles.kpiValue}>{stats.inProgress}</span>
          <span className={styles.kpiSub}>actively being worked</span>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiIcon} style={{ backgroundColor: "rgba(248,113,113,0.12)" }}>
            <Warning24Regular style={{ color: "#f87171" }} />
          </div>
          <span className={styles.kpiLabel}>HIGH / TOP PRIORITY</span>
          <span className={styles.kpiValue}>{stats.highPriority}</span>
          <span className={styles.kpiSub}>need attention</span>
        </div>
      </div>

      {/* Charts Row 1: Status + Priority */}
      <div className={styles.chartsGrid}>
        {/* Status Breakdown - Donut */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ borderLeftColor: "#4a9eff" }}>
            <span className={styles.chartTitleText}>STATUS BREAKDOWN</span>
          </div>
          <div className={styles.donutWrap}>
            <svg viewBox="0 0 100 100" width="150" height="150" style={{ flexShrink: 0 }}>
              <circle cx="50" cy="50" r="40" fill="none" strokeWidth="11" style={{ stroke: tokens.colorNeutralBackground3 }} />
              {(() => {
                let offset = 0;
                return donutSegments.map((seg) => {
                  const dash = donutTotal > 0 ? (seg.count / donutTotal) * circumference : 0;
                  const cur = offset;
                  offset += dash;
                  return (
                    <circle
                      key={seg.status}
                      cx="50" cy="50" r="40"
                      fill="none"
                      stroke={statusConfig[seg.status]?.color || "#ccc"}
                      strokeWidth="11"
                      strokeDasharray={`${dash} ${circumference}`}
                      strokeDashoffset={-cur}
                      transform="rotate(-90 50 50)"
                      style={{ transition: "stroke-dasharray 0.8s ease, stroke-dashoffset 0.8s ease" }}
                    />
                  );
                });
              })()}
              <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="700" style={{ fill: tokens.colorNeutralForeground1 }}>
                {donutTotal}
              </text>
              <text x="50" y="58" textAnchor="middle" fontSize="7" fontWeight="600" letterSpacing="1.5" style={{ fill: tokens.colorNeutralForeground3 }}>
                TOTAL
              </text>
            </svg>
            <div className={styles.legend}>
              {donutSegments.map((seg) => (
                <div key={seg.status} className={styles.legendRow}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div className={styles.legendDot} style={{ backgroundColor: statusConfig[seg.status]?.color }} />
                    <span style={{ fontSize: "13px", color: tokens.colorNeutralForeground2 }}>{statusConfig[seg.status]?.label}</span>
                  </div>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: tokens.colorNeutralForeground1 }}>{seg.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Distribution */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ borderLeftColor: "#f87171" }}>
            <span className={styles.chartTitleText}>PRIORITY DISTRIBUTION</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {priorityOrder.map((p) => {
              const cfg = priorityConfig[p];
              if (!cfg) return null;
              const count = stats.priorityMap.get(p) || 0;
              const pct = maxPriority > 0 ? (count / maxPriority) * 100 : 0;
              return (
                <div key={p} className={styles.barRow}>
                  <span className={styles.barLabel}>{cfg.label}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${Math.max(pct, count > 0 ? 15 : 0)}%`, backgroundColor: cfg.color }}>
                      {count > 0 && <span className={styles.barNum}>{count}</span>}
                    </div>
                  </div>
                  <span className={styles.barCountR}>{count}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.summaryLine}>
            <span style={{ fontSize: "10px", fontWeight: 600, fontFamily: tokens.fontFamilyMonospace, color: tokens.colorNeutralForeground3, letterSpacing: "0.5px" }}>
              HIGH + TOP PRIORITY
            </span>
            <span style={{ fontSize: "16px", fontWeight: 700, color: tokens.colorBrandForeground1 }}>
              {stats.highPriority}
            </span>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Types + Accounts */}
      <div className={styles.chartsGrid}>
        {/* Task Types */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ borderLeftColor: "#a78bfa" }}>
            <span className={styles.chartTitleText}>TASK TYPES</span>
          </div>
          <div className={styles.stackedBar}>
            {typeOrder.map((t) => {
              const count = stats.typeMap.get(t) || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return <div key={t} style={{ width: `${pct}%`, backgroundColor: typeConfig[t]?.color, transition: "width 0.6s ease", minWidth: count > 0 ? "4px" : 0 }} />;
            })}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {typeOrder.map((t) => {
              const cfg = typeConfig[t];
              if (!cfg) return null;
              const count = stats.typeMap.get(t) || 0;
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={t} className={styles.typeRow}>
                  <span className={styles.typeIcon} style={{ color: cfg.color }}>{cfg.icon}</span>
                  <span className={styles.typeLabel}>{cfg.label}</span>
                  <div className={styles.barTrack} style={{ height: "24px" }}>
                    <div className={styles.barFill} style={{ width: `${Math.max(stats.total > 0 ? (count / stats.total) * 100 : 0, count > 0 ? 15 : 0)}%`, backgroundColor: cfg.color, height: "100%" }}>
                      {count > 0 && <span className={styles.barNum} style={{ fontSize: "11px" }}>{count}</span>}
                    </div>
                  </div>
                  <span className={styles.barCountR} style={{ width: "50px" }}>{count} ({pct}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Items by Account */}
        <div className={styles.chartCard}>
          <div className={styles.chartTitle} style={{ borderLeftColor: "#3dd68c" }}>
            <span className={styles.chartTitleText}>ITEMS BY ACCOUNT</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {stats.accountCounts.map((a, i) => {
              const pct = maxAccount > 0 ? (a.count / maxAccount) * 100 : 0;
              const color = accountColors[i % accountColors.length];
              return (
                <div key={a.name} className={styles.barRow}>
                  <span className={styles.barLabel} title={a.name}>{a.name}</span>
                  <div className={styles.barTrack}>
                    <div className={styles.barFill} style={{ width: `${Math.max(pct, 15)}%`, backgroundColor: color }}>
                      <span className={styles.barNum}>{a.count}</span>
                    </div>
                  </div>
                  <span className={styles.barCountR}>{a.count}</span>
                </div>
              );
            })}
            {stats.accountCounts.length === 0 && (
              <Body1 style={{ color: tokens.colorNeutralForeground3, fontSize: "12px" }}>no account data</Body1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
