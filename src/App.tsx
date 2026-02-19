import React, { useEffect, useState } from "react";
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  createLightTheme,
  createDarkTheme,
  BrandVariants,
} from "@fluentui/react-components";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import {
  MsalProvider,
  AuthenticatedTemplate,
  UnauthenticatedTemplate,
  useMsal,
} from "@azure/msal-react";
import {
  PublicClientApplication,
  InteractionStatus,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import { msalConfig, loginRequest } from "./auth/msalConfig";
import { setTokenProvider } from "./services/dataverseService";
import { AppShell } from "./components/AppShell";
import { Dashboard } from "./pages/Dashboard";
import { Accounts } from "./pages/Accounts";
import { Contacts } from "./pages/Contacts";
import { Tasks } from "./pages/Tasks";
import { Impacts } from "./pages/Impacts";
import { Ideas } from "./pages/Ideas";
import { Projects } from "./pages/Projects";
import { MeetingSummaries } from "./pages/MeetingSummaries";
import { LoginPage } from "./pages/Login";
import { About } from "./pages/About";

// Brand color ramp based on reference accent blue #4a9eff
const ogBrand: BrandVariants = {
  10: "#0a0c10",
  20: "#0d1525",
  30: "#0f1f3b",
  40: "#112a52",
  50: "#13366a",
  60: "#154283",
  70: "#174f9d",
  80: "#4a9eff",
  90: "#62aeff",
  100: "#7abeff",
  110: "#92ceff",
  120: "#aadeff",
  130: "#c2eaff",
  140: "#d4f0ff",
  150: "#e6f6ff",
  160: "#f2fbff",
};

const ogDarkTheme = {
  ...webDarkTheme,
  ...createDarkTheme(ogBrand),
  // Surfaces from reference
  colorNeutralBackground1: "#12151c",
  colorNeutralBackground1Hover: "#1f2330",
  colorNeutralBackground1Pressed: "#252a36",
  colorNeutralBackground1Selected: "#1a1e28",
  colorNeutralBackground2: "#0a0c10",
  colorNeutralBackground2Hover: "#1a1e28",
  colorNeutralBackground3: "#1a1e28",
  colorNeutralBackground4: "#1f2330",
  colorSubtleBackground: "transparent",
  colorSubtleBackgroundHover: "#1a1e28",
  colorSubtleBackgroundPressed: "#1f2330",
  colorSubtleBackgroundSelected: "#1a1e28",
  // Text
  colorNeutralForeground1: "#e2e4e9",
  colorNeutralForeground2: "#7a8192",
  colorNeutralForeground3: "#4a5168",
  colorNeutralForeground4: "#4a5168",
  colorNeutralForegroundDisabled: "#4a5168",
  // Brand / accent
  colorBrandForeground1: "#4a9eff",
  colorBrandForeground2: "#4a9eff",
  colorBrandForegroundLink: "#4a9eff",
  colorBrandForegroundLinkHover: "#62aeff",
  colorBrandBackground: "#4a9eff",
  colorBrandBackground2: "rgba(74, 158, 255, 0.12)",
  colorBrandBackground2Hover: "rgba(74, 158, 255, 0.18)",
  colorBrandBackground2Pressed: "rgba(74, 158, 255, 0.24)",
  colorBrandBackgroundHover: "#62aeff",
  colorBrandBackgroundPressed: "#174f9d",
  colorCompoundBrandForeground1: "#4a9eff",
  colorCompoundBrandForeground1Hover: "#62aeff",
  colorCompoundBrandForeground1Pressed: "#174f9d",
  colorCompoundBrandBackground: "#4a9eff",
  colorCompoundBrandBackgroundHover: "#62aeff",
  colorCompoundBrandStroke: "#4a9eff",
  colorCompoundBrandStrokeHover: "#62aeff",
  // Borders
  colorNeutralStroke1: "#252a36",
  colorNeutralStroke2: "#1a1e28",
  colorNeutralStroke3: "#1f2330",
  colorNeutralStrokeAccessible: "#252a36",
  colorNeutralStrokeAccessibleHover: "#4a5168",
  // Shadows — subtle, dark-appropriate
  shadow2: "0 1px 2px rgba(0,0,0,0.3)",
  shadow4: "0 2px 4px rgba(0,0,0,0.25)",
  shadow8: "0 4px 8px rgba(0,0,0,0.3)",
  shadow16: "0 8px 16px rgba(0,0,0,0.35)",
  shadow28: "0 14px 28px rgba(0,0,0,0.4)",
  shadow64: "0 32px 64px rgba(0,0,0,0.5)",
  // Font
  fontFamilyBase: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', monospace",
};

const ogLightTheme = {
  ...webLightTheme,
  ...createLightTheme(ogBrand),
  colorNeutralBackground1: "#ffffff",
  colorNeutralBackground2: "#f5f6f8",
  colorNeutralBackground3: "#ecedf0",
  colorNeutralBackground4: "#e2e4e8",
  colorNeutralForeground1: "#1a1e28",
  colorNeutralForeground2: "#4a5168",
  colorNeutralForeground3: "#7a8192",
  colorBrandForeground1: "#1565c0",
  colorBrandForeground2: "#1565c0",
  colorBrandForegroundLink: "#1565c0",
  colorNeutralStroke1: "#dcdee3",
  colorNeutralStroke2: "#ecedf0",
  fontFamilyBase: "'DM Sans', -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', monospace",
};

const msalInstance = new PublicClientApplication(msalConfig);

// Token provider setup component — gates children until token provider is ready
const TokenProviderSetup: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { instance, accounts, inProgress } = useMsal();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && inProgress === InteractionStatus.None) {
      setTokenProvider(async () => {
        try {
          const response = await instance.acquireTokenSilent({
            ...loginRequest,
            account: accounts[0],
          });
          return response.accessToken;
        } catch (error) {
          if (error instanceof InteractionRequiredAuthError) {
            const response = await instance.acquireTokenPopup(loginRequest);
            return response.accessToken;
          }
          throw error;
        }
      });
      setReady(true);
    }
  }, [instance, accounts, inProgress]);

  if (!ready) return null;
  return <>{children}</>;
};

const ThemedApp: React.FC = () => {
  const { isDark } = useTheme();
  const theme = isDark ? ogDarkTheme : ogLightTheme;

  return (
    <FluentProvider theme={theme}>
      <BrowserRouter>
        <AuthenticatedTemplate>
          <TokenProviderSetup>
            <Routes>
              <Route element={<AppShell />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/impacts" element={<Impacts />} />
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/summaries" element={<MeetingSummaries />} />
                <Route path="/about" element={<About />} />
              </Route>
            </Routes>
          </TokenProviderSetup>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <LoginPage />
        </UnauthenticatedTemplate>
      </BrowserRouter>
    </FluentProvider>
  );
};

const App: React.FC = () => {
  return (
    <MsalProvider instance={msalInstance}>
      <ThemeProvider>
        <ThemedApp />
      </ThemeProvider>
    </MsalProvider>
  );
};

export default App;
