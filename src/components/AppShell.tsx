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
  ContactCard24Regular,
  ContactCard24Filled,
  Star24Regular,
  Star24Filled,
  TaskListSquareLtr24Regular,
  TaskListSquareLtr24Filled,
  Flash24Regular,
  Flash24Filled,
  Lightbulb24Regular,
  Lightbulb24Filled,
  SignOut24Regular,
  Navigation24Regular,
  ChevronLeft24Regular,
  WeatherMoon24Regular,
  WeatherSunny24Regular,
} from "@fluentui/react-icons";
import { useMsal } from "@azure/msal-react";
import { useTheme } from "../context/ThemeContext";

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED = 56;

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
    boxShadow: tokens.shadow4,
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
    ...shorthands.padding("16px", "12px"),
    minHeight: "56px",
  },
  brandArea: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    overflow: "hidden",
    whiteSpace: "nowrap",
  },
  brandIcon: {
    width: "32px",
    height: "32px",
    ...shorthands.borderRadius("6px"),
    backgroundColor: "#0078d4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    color: "white",
    fontWeight: "bold",
    fontSize: "11px",
  },
  navSection: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("8px"),
    ...shorthands.gap("2px"),
    flexGrow: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("12px"),
    ...shorthands.padding("10px", "12px"),
    ...shorthands.borderRadius("8px"),
    cursor: "pointer",
    border: "none",
    backgroundColor: "transparent",
    color: tokens.colorNeutralForeground2,
    transition: "all 0.15s ease",
    overflow: "hidden",
    whiteSpace: "nowrap",
    width: "100%",
    textAlign: "left",
    fontSize: "14px",
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
    fontSize: "20px",
    display: "flex",
    alignItems: "center",
  },
  bottomSection: {
    ...shorthands.padding("8px"),
    marginTop: "auto",
  },
  userArea: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("10px"),
    ...shorthands.padding("10px", "12px"),
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
    ...shorthands.padding("12px", "24px"),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow2,
    minHeight: "56px",
  },
  pageContent: {
    flexGrow: 1,
    ...shorthands.padding("24px"),
    overflow: "auto",
  },
  themeToggle: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
});

interface NavItem {
  key: string;
  label: string;
  path: string;
  icon: React.ReactElement;
  iconActive: React.ReactElement;
}

const navItems: NavItem[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/",
    icon: <Home24Regular />,
    iconActive: <Home24Filled />,
  },
  {
    key: "accounts",
    label: "Accounts",
    path: "/accounts",
    icon: <Building24Regular />,
    iconActive: <Building24Filled />,
  },
  {
    key: "contacts",
    label: "Contacts",
    path: "/contacts",
    icon: <ContactCard24Regular />,
    iconActive: <ContactCard24Filled />,
  },
  {
    key: "tasks",
    label: "Action Items",
    path: "/tasks",
    icon: <TaskListSquareLtr24Regular />,
    iconActive: <TaskListSquareLtr24Filled />,
  },
  {
    key: "ideas",
    label: "Ideas",
    path: "/ideas",
    icon: <Lightbulb24Regular />,
    iconActive: <Lightbulb24Filled />,
  },
  {
    key: "activities",
    label: "High-Value Activities",
    path: "/activities",
    icon: <Star24Regular />,
    iconActive: <Star24Filled />,
  },
  {
    key: "impacts",
    label: "Impacts",
    path: "/impacts",
    icon: <Flash24Regular />,
    iconActive: <Flash24Filled />,
  },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Accounts",
  "/contacts": "Contacts",
  "/tasks": "Action Items",
  "/ideas": "Ideas",
  "/activities": "High-Value Activities",
  "/impacts": "Impacts",
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
  const pageTitle = pageTitles[currentPath] ?? "Page";

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
            <div className={styles.brandIcon}>O'G</div>
            {expanded && (
              <Text weight="semibold" size={400}>
                O'G Central
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

        <Divider />

        <div className={styles.navSection}>
          {navItems.map((item) => {
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
                  <span className={styles.navIcon}>
                    {isActive ? item.iconActive : item.icon}
                  </span>
                  {expanded && <span>{item.label}</span>}
                </button>
              </Tooltip>
            );
          })}
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
          <Text size={500} weight="semibold">
            {pageTitle}
          </Text>
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
          <Outlet />
        </main>
      </div>
    </div>
  );
};
