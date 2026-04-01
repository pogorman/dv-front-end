import React, { useState } from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  makeStyles,
  tokens,
  shorthands,
  Button,
  Text,
  Avatar,
  Divider,
  Tooltip,
  Switch,
} from "@fluentui/react-components";
import {
  Home24Regular,
  Home24Filled,
  Building24Regular,
  Building24Filled,
  Person24Regular,
  Person24Filled,
  CheckboxChecked24Regular,
  CheckboxChecked24Filled,
  Flash24Regular,
  Flash24Filled,
  LightbulbFilament24Regular,
  LightbulbFilament24Filled,
  Briefcase24Regular,
  Briefcase24Filled,
  PeopleTeam24Regular,
  PeopleTeam24Filled,
  SignOut24Regular,
  Navigation24Regular,
  ChevronLeft24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
  Info24Regular,
  Info24Filled,
  Grid24Regular,
  Grid24Filled,
} from "@fluentui/react-icons";
import { useMsal } from "@azure/msal-react";
import { useTheme } from "../context/ThemeContext";
import { NotificationProvider } from "../context/NotificationContext";
import { CopilotChat } from "./CopilotChat";

const SIDEBAR_WIDTH = 188;
const SIDEBAR_COLLAPSED = 48;

const useStyles = makeStyles({
  root: {
    display: "flex",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
  },
  sidebar: {
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
    borderRight: `1px solid ${tokens.colorNeutralStroke1}`,
    transition: "width 0.2s ease",
    overflow: "hidden",
    zIndex: 10,
  },
  sidebarExpanded: {
    width: `${SIDEBAR_WIDTH}px`,
    minWidth: `${SIDEBAR_WIDTH}px`,
  },
  sidebarCollapsed: {
    width: `${SIDEBAR_COLLAPSED}px`,
    minWidth: `${SIDEBAR_COLLAPSED}px`,
  },
  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("12px", "10px"),
    minHeight: "48px",
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  brandIcon: {
    width: "36px",
    height: "36px",
    flexShrink: 0,
  },
  navSection: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("6px"),
    ...shorthands.gap("1px"),
    flexGrow: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    ...shorthands.padding("7px", "10px"),
    ...shorthands.borderRadius("6px"),
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground2,
    fontFamily: tokens.fontFamilyBase,
    transition: "all 0.15s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: "100%",
    textAlign: "left",
    fontSize: "13px",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      color: tokens.colorNeutralForeground1,
    },
  },
  navItemActive: {
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    fontWeight: "600",
    ":hover": {
      backgroundColor: tokens.colorBrandBackground2Hover,
      color: tokens.colorBrandForeground1,
    },
  },
  navIcon: {
    flexShrink: 0,
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
  },
  bottomSection: {
    ...shorthands.padding("6px"),
    marginTop: "auto",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
    ...shorthands.padding("8px", "10px"),
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  mainContent: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "auto",
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("10px", "6px"),
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    minHeight: "48px",
  },
  pageContent: {
    flexGrow: 1,
    ...shorthands.padding("20px", "5px"),
    overflow: "auto",
  },
  themeToggle: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
  sectionLabel: {
    ...shorthands.padding("8px", "10px", "4px"),
    fontSize: "10px",
    fontWeight: "600",
    fontFamily: tokens.fontFamilyMonospace,
    color: tokens.colorNeutralForeground3,
    textTransform: "none",
    letterSpacing: "1.5px",
  },
  sectionDivider: {
    ...shorthands.margin("6px", "0"),
  },
});

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactElement;
  iconActive: React.ReactElement;
  color?: string;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    label: "insights",
    items: [
      {
        key: "dashboard",
        label: "dashboard",
        path: "/",
        icon: <Home24Regular />,
        iconActive: <Home24Filled />,
        color: "#4a9eff",
      },
      {
        key: "board",
        label: "my board",
        path: "/board",
        icon: <Grid24Regular />,
        iconActive: <Grid24Filled />,
        color: "#4a9eff",
      },
    ],
  },
  {
    label: "activity",
    items: [
      {
        key: "tasks",
        label: "tasks",
        path: "/tasks",
        icon: <CheckboxChecked24Regular />,
        iconActive: <CheckboxChecked24Filled />,
        color: "#f87171",
      },
      {
        key: "personal",
        label: "personal",
        path: "/personal",
        icon: <Home24Regular />,
        iconActive: <Home24Filled />,
        color: "#22d3ee",
      },
      {
        key: "ideas",
        label: "ideas",
        path: "/ideas",
        icon: <LightbulbFilament24Regular />,
        iconActive: <LightbulbFilament24Filled />,
        color: "#a78bfa",
      },
      {
        key: "summaries",
        label: "meetings",
        path: "/summaries",
        icon: <PeopleTeam24Regular />,
        iconActive: <PeopleTeam24Filled />,
        color: "#fb923c",
      },
    ],
  },
  {
    label: "core",
    items: [
      {
        key: "accounts",
        label: "accounts",
        path: "/accounts",
        icon: <Building24Regular />,
        iconActive: <Building24Filled />,
        color: "#3dd68c",
      },
      {
        key: "contacts",
        label: "contacts",
        path: "/contacts",
        icon: <Person24Regular />,
        iconActive: <Person24Filled />,
        color: "#22d3ee",
      },
      {
        key: "projects",
        label: "projects",
        path: "/projects",
        icon: <Briefcase24Regular />,
        iconActive: <Briefcase24Filled />,
        color: "#e879f9",
      },
    ],
  },
  {
    label: "capture",
    items: [
      {
        key: "impacts",
        label: "impacts",
        path: "/impacts",
        icon: <Flash24Regular />,
        iconActive: <Flash24Filled />,
        color: "#f59e0b",
      },
    ],
  },
  {
    label: "",
    items: [
      {
        key: "about",
        label: "about this site",
        path: "/about",
        icon: <Info24Regular />,
        iconActive: <Info24Filled />,
      },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/": "dashboard",
  "/board": "my board",
  "/accounts": "accounts",
  "/contacts": "contacts",
  "/tasks": "tasks",
  "/ideas": "ideas",
  "/personal": "personal",
  "/projects": "projects",
  "/impacts": "impacts",
  "/summaries": "meetings",
  "/about": "about this site",
};

const pageIcons: Record<string, { icon: React.ReactNode; color: string }> = {
  "/": { icon: <Home24Filled />, color: "#4a9eff" },
  "/board": { icon: <Grid24Filled />, color: "#4a9eff" },
  "/tasks": { icon: <CheckboxChecked24Filled />, color: "#f87171" },
  "/ideas": { icon: <LightbulbFilament24Filled />, color: "#a78bfa" },
  "/personal": { icon: <Home24Filled />, color: "#22d3ee" },
  "/impacts": { icon: <Flash24Filled />, color: "#f59e0b" },
  "/accounts": { icon: <Building24Filled />, color: "#3dd68c" },
  "/contacts": { icon: <Person24Filled />, color: "#22d3ee" },
  "/projects": { icon: <Briefcase24Filled />, color: "#e879f9" },
  "/summaries": { icon: <PeopleTeam24Filled />, color: "#fb923c" },
  "/about": { icon: <Info24Filled />, color: "#4a9eff" },
};

export const AppShell: React.FC = () => {
  const styles = useStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const { instance, accounts } = useMsal();
  const { isDark, toggleTheme } = useTheme();
  const [expanded, setExpanded] = useState(true);

  const currentAccount = accounts[0];
  const displayName = currentAccount?.name ?? "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const currentPath = location.pathname;
  const pageTitle = pageTitles[currentPath] ?? "page";

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <nav
        className={`${styles.sidebar} ${expanded ? styles.sidebarExpanded : styles.sidebarCollapsed}`}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.brandArea}>
            <svg className={styles.brandIcon} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="18" fill="none" stroke="#4a9eff" strokeWidth="3" />
              <path d="M22 32 L29 39 L42 24" fill="none" stroke="#4a9eff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {expanded && (
              <Text weight="semibold" size={400}>
                My Work
              </Text>
            )}
          </div>
          <Button
            appearance="subtle"
            icon={expanded ? <ChevronLeft24Regular /> : <Navigation24Regular />}
            onClick={() => setExpanded(!expanded)}
            size="small"
          />
        </div>

        <div className={styles.navSection}>
          {/* Sections */}
          {navSections.map((section, idx) => (
            <React.Fragment key={section.label || `section-${idx}`}>
              <Divider className={styles.sectionDivider} />
              {expanded && section.label && (
                <div className={styles.sectionLabel}>{section.label}</div>
              )}
              {section.items.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <Tooltip
                    content={item.label}
                    relationship="label"
                    positioning="after"
                    key={item.key}
                  >
                    <button
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
                      onClick={() => navigate(item.path)}
                    >
                      <span className={styles.navIcon} style={{ color: item.color }}>
                        {isActive ? item.iconActive : item.icon}
                      </span>
                      {expanded && <span>{item.label}</span>}
                    </button>
                  </Tooltip>
                );
              })}
            </React.Fragment>
          ))}
        </div>

        <Divider />

        <div className={styles.bottomSection}>
          <div className={styles.userArea}>
            <Avatar name={displayName} initials={initials} size={32} color="brand" />
            {expanded && (
              <div style={{ overflow: "hidden" }}>
                <Text size={200} weight="semibold" block truncate>
                  {displayName}
                </Text>
                <Text
                  size={100}
                  style={{ color: tokens.colorNeutralForeground3 }}
                  block
                  truncate
                >
                  {currentAccount?.username ?? ""}
                </Text>
              </div>
            )}
          </div>
          <Tooltip content="Sign out" relationship="label" positioning="after">
            <button className={styles.navItem} onClick={handleLogout}>
              <span className={styles.navIcon}>
                <SignOut24Regular />
              </span>
              {expanded && <span>Sign out</span>}
            </button>
          </Tooltip>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {pageIcons[currentPath] && (
              <span style={{ display: "flex", color: pageIcons[currentPath].color }}>
                {pageIcons[currentPath].icon}
              </span>
            )}
            <Text size={500} weight="semibold">
              {pageTitle}
            </Text>
          </div>
          <div className={styles.themeToggle}>
            <WeatherSunny24Regular />
            <Switch
              checked={isDark}
              onChange={toggleTheme}
              aria-label="Toggle dark mode"
            />
            <WeatherMoon24Regular />
          </div>
        </header>
        <main className={styles.pageContent}>
          <NotificationProvider>
            <Outlet />
          </NotificationProvider>
        </main>
      </div>

      {/* Copilot Chat */}
      <CopilotChat />
    </div>
  );
};
