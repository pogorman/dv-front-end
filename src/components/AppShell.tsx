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
    width: "28px",
    height: "28px",
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
    ...shorthands.padding("10px", "24px"),
    backgroundColor: tokens.colorNeutralBackground1,
    borderBottom: `1px solid ${tokens.colorNeutralStroke1}`,
    minHeight: "48px",
  },
  pageContent: {
    flexGrow: 1,
    ...shorthands.padding("20px"),
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
    textTransform: "uppercase",
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
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const dashboardItem: NavItem = {
  key: "dashboard",
  label: "Dashboard",
  path: "/",
  icon: <Home24Regular />,
  iconActive: <Home24Filled />,
};

const navSections: NavSection[] = [
  {
    label: "Activity",
    items: [
      {
        key: "tasks",
        label: "Action Items",
        path: "/tasks",
        icon: <CheckboxChecked24Regular />,
        iconActive: <CheckboxChecked24Filled />,
      },
      {
        key: "ideas",
        label: "Ideas",
        path: "/ideas",
        icon: <LightbulbFilament24Regular />,
        iconActive: <LightbulbFilament24Filled />,
      },
      {
        key: "impacts",
        label: "Impacts",
        path: "/impacts",
        icon: <Flash24Regular />,
        iconActive: <Flash24Filled />,
      },
    ],
  },
  {
    label: "Core",
    items: [
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
        icon: <Person24Regular />,
        iconActive: <Person24Filled />,
      },
      {
        key: "projects",
        label: "Projects",
        path: "/projects",
        icon: <Briefcase24Regular />,
        iconActive: <Briefcase24Filled />,
      },
      {
        key: "summaries",
        label: "Summaries",
        path: "/summaries",
        icon: <PeopleTeam24Regular />,
        iconActive: <PeopleTeam24Filled />,
      },
    ],
  },
  {
    label: "",
    items: [
      {
        key: "about",
        label: "About this site",
        path: "/about",
        icon: <Info24Regular />,
        iconActive: <Info24Filled />,
      },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/accounts": "Accounts",
  "/contacts": "Contacts",
  "/tasks": "Action Items",
  "/ideas": "Ideas",
  "/projects": "Projects",
  "/impacts": "Impacts",
  "/summaries": "Summaries",
  "/about": "About this site",
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
            <svg className={styles.brandIcon} viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="shield-bg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" style={{ stopColor: "#4a9eff" }} />
                  <stop offset="100%" style={{ stopColor: "#174f9d" }} />
                </linearGradient>
              </defs>
              <path d="M32 2 L58 14 V36 C58 50 46 60 32 62 C18 60 6 50 6 36 V14 Z" fill="url(#shield-bg)" stroke="#fff" strokeWidth="2" />
              <text x="32" y="44" fontFamily="DM Sans,Arial,sans-serif" fontSize="26" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="-1">OG</text>
            </svg>
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
          {/* Dashboard */}
          <Tooltip
            content={dashboardItem.label}
            relationship="label"
            positioning="after"
          >
            <button
              className={`${styles.navItem} ${currentPath === dashboardItem.path ? styles.navItemActive : ""}`}
              onClick={() => navigate(dashboardItem.path)}
            >
              <span className={styles.navIcon}>
                {currentPath === dashboardItem.path ? dashboardItem.iconActive : dashboardItem.icon}
              </span>
              {expanded && <span>{dashboardItem.label}</span>}
            </button>
          </Tooltip>

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
                      <span className={styles.navIcon}>
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
