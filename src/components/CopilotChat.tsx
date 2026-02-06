import React, { useState, useRef } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Button,
  Text,
  Spinner,
} from "@fluentui/react-components";
import {
  Chat24Regular,
  Chat24Filled,
  Dismiss24Regular,
} from "@fluentui/react-icons";
import ReactWebChat, { createDirectLine } from "botframework-webchat";
import { useTheme } from "../context/ThemeContext";
import { useMsal } from "@azure/msal-react";

// Copilot Studio configuration
const COPILOT_TOKEN_ENDPOINT =
  "https://0582014c9a6de35b87055168c385f4.13.environment.api.powerplatform.com/copilotstudio/dataverse-backed/authenticated/bots/auto_agent_s82bp/conversations?api-version=2022-03-01-preview";

const useStyles = makeStyles({
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "56px",
    height: "56px",
    ...shorthands.borderRadius("50%"),
    backgroundColor: tokens.colorBrandBackground,
    color: "white",
    boxShadow: tokens.shadow16,
    zIndex: 1000,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "none",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    ":hover": {
      transform: "scale(1.05)",
      boxShadow: tokens.shadow28,
    },
  },
  chatPanel: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "400px",
    height: "600px",
    ...shorthands.borderRadius("12px"),
    backgroundColor: tokens.colorNeutralBackground1,
    boxShadow: tokens.shadow64,
    zIndex: 1000,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  chatHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    ...shorthands.padding("12px", "16px"),
    backgroundColor: tokens.colorBrandBackground,
    color: "white",
  },
  headerTitle: {
    display: "flex",
    alignItems: "center",
    ...shorthands.gap("8px"),
  },
  chatBody: {
    flexGrow: 1,
    overflow: "hidden",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
    flexDirection: "column",
    ...shorthands.gap("12px"),
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    textAlign: "center",
    ...shorthands.padding("0", "16px"),
  },
});

export const CopilotChat: React.FC = () => {
  const styles = useStyles();
  const { isDark } = useTheme();
  const { instance, accounts } = useMsal();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [directLine, setDirectLine] = useState<ReturnType<
    typeof createDirectLine
  > | null>(null);
  const initializingRef = useRef(false);

  const initializeChat = async () => {
    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) return;
    initializingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Get access token for Power Platform API
      if (accounts.length === 0) {
        throw new Error("No authenticated account");
      }

      let accessToken: string;
      // Use Power Platform API scope
      const powerPlatformScope = "https://api.powerplatform.com/.default";
      try {
        const tokenResponse = await instance.acquireTokenSilent({
          scopes: [powerPlatformScope],
          account: accounts[0],
        });
        accessToken = tokenResponse.accessToken;
      } catch {
        // Try popup if silent fails
        const tokenResponse = await instance.acquireTokenPopup({
          scopes: [powerPlatformScope],
        });
        accessToken = tokenResponse.accessToken;
      }

      console.log("Got Power Platform token, starting conversation...");

      // Step 2: Start conversation with Copilot Studio
      const response = await fetch(COPILOT_TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Copilot API error:", response.status, errorText);
        throw new Error(`Copilot API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log("Conversation started:", data.conversationId);

      // Step 3: Create DirectLine connection
      const dl = createDirectLine({ token: data.token });
      setDirectLine(dl);
      setIsLoading(false);
    } catch (err) {
      console.error("Failed to initialize chat:", err);
      setError(
        err instanceof Error ? err.message : "Failed to connect to assistant"
      );
      setIsLoading(false);
    } finally {
      initializingRef.current = false;
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    if (!directLine && !isLoading) {
      initializeChat();
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Don't reset directLine so conversation persists if reopened
  };

  const handleRetry = () => {
    setDirectLine(null);
    setError(null);
    initializeChat();
  };

  const styleOptions = {
    backgroundColor: isDark ? "#1f1f1f" : "#ffffff",
    primaryFont: "'Segoe UI', sans-serif",
    bubbleBackground: isDark ? "#2d2d2d" : "#f0f0f0",
    bubbleTextColor: isDark ? "#ffffff" : "#242424",
    bubbleFromUserBackground: tokens.colorBrandBackground,
    bubbleFromUserTextColor: "#ffffff",
    bubbleBorderRadius: 8,
    sendBoxBackground: isDark ? "#2d2d2d" : "#ffffff",
    sendBoxTextColor: isDark ? "#ffffff" : "#242424",
    sendBoxButtonColor: tokens.colorBrandBackground,
    sendBoxButtonColorOnHover: tokens.colorBrandBackgroundHover,
    sendBoxBorderTop: `1px solid ${isDark ? "#404040" : "#e0e0e0"}`,
    botAvatarInitials: "AI",
    userAvatarInitials: "You",
    hideUploadButton: true,
  };

  if (!isOpen) {
    return (
      <button
        className={styles.floatingButton}
        onClick={handleOpen}
        aria-label="Open chat"
      >
        <Chat24Filled />
      </button>
    );
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <Chat24Regular />
          <Text weight="semibold" style={{ color: "white" }}>
            O'G Assistant
          </Text>
        </div>
        <Button
          appearance="subtle"
          icon={<Dismiss24Regular />}
          onClick={handleClose}
          style={{ color: "white" }}
          aria-label="Close chat"
        />
      </div>
      <div className={styles.chatBody}>
        {isLoading ? (
          <div className={styles.loadingContainer}>
            <Spinner size="medium" />
            <Text>Connecting to assistant...</Text>
          </div>
        ) : error ? (
          <div className={styles.loadingContainer}>
            <Text className={styles.errorText}>{error}</Text>
            <Button appearance="primary" onClick={handleRetry}>
              Retry
            </Button>
          </div>
        ) : directLine ? (
          <ReactWebChat
            directLine={directLine}
            styleOptions={styleOptions}
            locale="en-US"
          />
        ) : null}
      </div>
    </div>
  );
};
