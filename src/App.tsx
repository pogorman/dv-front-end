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
import { Activities } from "./pages/Activities";
import { Tasks } from "./pages/Tasks";
import { Impacts } from "./pages/Impacts";
import { Ideas } from "./pages/Ideas";
import { Projects } from "./pages/Projects";
import { MeetingSummaries } from "./pages/MeetingSummaries";
import { LoginPage } from "./pages/Login";

// Microsoft-themed brand colors
const microsoftBrand: BrandVariants = {
  10: "#020305",
  20: "#111723",
  30: "#16263D",
  40: "#193253",
  50: "#1B3F6A",
  60: "#1B4C82",
  70: "#18599B",
  80: "#0F6CBD",
  90: "#2886DE",
  100: "#479FEF",
  110: "#62B4F6",
  120: "#77C5FA",
  130: "#96D6FF",
  140: "#B4E0FC",
  150: "#CFE9FC",
  160: "#E6F2FC",
};

const microsoftLightTheme = {
  ...webLightTheme,
  ...createLightTheme(microsoftBrand),
};

const microsoftDarkTheme = {
  ...webDarkTheme,
  ...createDarkTheme(microsoftBrand),
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
  const theme = isDark ? microsoftDarkTheme : microsoftLightTheme;

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
                <Route path="/activities" element={<Activities />} />
                <Route path="/tasks" element={<Tasks />} />
                <Route path="/impacts" element={<Impacts />} />
                <Route path="/ideas" element={<Ideas />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/summaries" element={<MeetingSummaries />} />
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
