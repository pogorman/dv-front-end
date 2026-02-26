import React, { useState, useRef } from "react";
import {
  makeStyles,
  tokens,
  shorthands,
  Button,
  Text,
  Spinner,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import ReactWebChat, { createDirectLine, createStore } from "botframework-webchat";
import { useTheme } from "../context/ThemeContext";
import { useMsal } from "@azure/msal-react";

// Copilot Studio Direct Line configuration (set REACT_APP_COPILOT_DIRECT_LINE_SECRET in .env)
const DIRECT_LINE_SECRET = process.env.REACT_APP_COPILOT_DIRECT_LINE_SECRET || "";

// Custom scope for SSO with the bot
const BOT_SSO_SCOPE = "api://3c6a1f01-09c5-49c7-8be7-48c33e177432/mcs-read-scope";

const useStyles = makeStyles({
  floatingButton: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "48px",
    height: "48px",
    ...shorthands.borderRadius("0"),
    backgroundColor: "transparent",
    border: "none",
    boxShadow: "none",
    zIndex: 1000,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    ...shorthands.padding("0"),
    overflow: "visible",
    transition: "transform 0.2s ease",
    ":hover": {
      transform: "scale(1.15)",
    },
  },
  headerImg: {
    width: "24px",
    height: "24px",
    objectFit: "contain" as const,
  },
  chatPanel: {
    position: "fixed",
    bottom: "24px",
    right: "24px",
    width: "400px",
    height: "600px",
    ...shorthands.borderRadius("8px"),
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
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
  const [store, setStore] = useState<ReturnType<typeof createStore> | null>(null);
  const initializingRef = useRef(false);
  const ssoTokenRef = useRef<string | null>(null);

  // Function to get SSO token (can be called to refresh)
  const acquireSsoToken = async (): Promise<string | null> => {
    if (accounts.length === 0) return null;

    try {
      const tokenResponse = await instance.acquireTokenSilent({
        scopes: [BOT_SSO_SCOPE],
        account: accounts[0],
      });
      ssoTokenRef.current = tokenResponse.accessToken;
      console.log("Got SSO token for bot");
      return tokenResponse.accessToken;
    } catch (err) {
      console.log("Silent token failed, trying popup...");
      try {
        const tokenResponse = await instance.acquireTokenPopup({
          scopes: [BOT_SSO_SCOPE],
        });
        ssoTokenRef.current = tokenResponse.accessToken;
        return tokenResponse.accessToken;
      } catch (popupErr) {
        console.warn("Could not get SSO token:", popupErr);
        return null;
      }
    }
  };

  const initializeChat = async () => {
    // Prevent multiple simultaneous initialization attempts
    if (initializingRef.current) return;
    initializingRef.current = true;

    setIsLoading(true);
    setError(null);

    try {
      // Check for Direct Line secret
      if (!DIRECT_LINE_SECRET) {
        throw new Error("Direct Line secret not configured");
      }

      // Step 1: Get user's Azure AD token for SSO
      await acquireSsoToken();

      // Step 2: Exchange Direct Line secret for a token
      const dlTokenResponse = await fetch(
        "https://directline.botframework.com/v3/directline/tokens/generate",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${DIRECT_LINE_SECRET}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user: {
              id: accounts[0]?.localAccountId || "user",
              name: accounts[0]?.name || "User",
            },
          }),
        }
      );

      if (!dlTokenResponse.ok) {
        const errorText = await dlTokenResponse.text();
        console.error("Direct Line token error:", dlTokenResponse.status, errorText);
        throw new Error(`Failed to get token: ${dlTokenResponse.status}`);
      }

      const tokenData = await dlTokenResponse.json();
      console.log("Got Direct Line token, conversation:", tokenData.conversationId);

      // Create DirectLine connection with the token
      const dl = createDirectLine({
        token: tokenData.token,
      });

      // Create a store that handles SSO token exchange
      const chatStore = createStore({}, () => (next: (action: unknown) => unknown) => (action: unknown) => {
        const typedAction = action as {
          type: string;
          payload?: {
            activity?: {
              type: string;
              name: string;
              value?: { connectionName?: string; id?: string }
            }
          }
        };

        // Handle OAuth token exchange request from bot
        if (
          typedAction.type === "DIRECT_LINE/INCOMING_ACTIVITY" &&
          typedAction.payload?.activity?.type === "invoke" &&
          typedAction.payload?.activity?.name === "signin/tokenExchange"
        ) {
          const connectionName = typedAction.payload.activity.value?.connectionName;
          const exchangeId = typedAction.payload.activity.value?.id;

          // Try to get a fresh SSO token and send it to the bot
          (async () => {
            let token = ssoTokenRef.current;

            // If no cached token, try to acquire one
            if (!token) {
              token = await acquireSsoToken();
            }

            if (token) {
              dl.postActivity({
                type: "event",
                name: "signin/tokenExchange",
                from: {
                  id: accounts[0]?.localAccountId || "user",
                  name: accounts[0]?.name || "User",
                },
                value: {
                  id: exchangeId || connectionName,
                  connectionName: connectionName,
                  token: token,
                },
              } as Parameters<typeof dl.postActivity>[0]).subscribe({
                next: () => console.log("Sent SSO token exchange to bot"),
                error: (err: Error) => console.error("Failed to send token exchange:", err),
              });
            } else {
              console.warn("No SSO token available for token exchange");
            }
          })();
        }

        return next(action);
      });

      setStore(chatStore);
      setDirectLine(dl);

      // Wait for connection to be established, then send welcome event
      const subscription = dl.connectionStatus$.subscribe({
        next: (status: number) => {
          // ConnectionStatus.Online = 2
          if (status === 2) {
            // Send welcome event to trigger bot's greeting
            dl.postActivity({
              type: "event",
              name: "startConversation",
              from: {
                id: accounts[0]?.localAccountId || "user",
                name: accounts[0]?.name || "User",
              },
            } as Parameters<typeof dl.postActivity>[0]).subscribe({
              next: () => console.log("Sent startConversation event"),
              error: (err: Error) => console.warn("Failed to send startConversation:", err),
            });
            subscription.unsubscribe();
          }
        },
      });

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
    botAvatarImage: "/images/og_logo_white.png",
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
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="10 4 44 54" width="48" height="48">
          <path d="M32 8 C28 16 25 26 25 38 L39 38 C39 26 36 16 32 8Z" fill="#4a9eff"/>
          <circle cx="32" cy="26" r="4" fill="#174f9d"/>
          <path d="M25 34 L17 44 L25 40Z" fill="#4a9eff" opacity="0.85"/>
          <path d="M39 34 L47 44 L39 40Z" fill="#4a9eff" opacity="0.85"/>
          <rect x="27" y="38" width="10" height="3" rx="1" fill="#a0c4ff"/>
          <path d="M28 41 L32 54 L36 41Z" fill="#f59e0b"/>
          <path d="M30 41 L32 50 L34 41Z" fill="#f87171"/>
        </svg>
      </button>
    );
  }

  return (
    <div className={styles.chatPanel}>
      <div className={styles.chatHeader}>
        <div className={styles.headerTitle}>
          <img src="/images/og_logo_white.png" alt="boom!" className={styles.headerImg} />
          <Text weight="semibold" style={{ color: "white" }}>
            boom!
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
        ) : directLine && store ? (
          <ReactWebChat
            directLine={directLine}
            store={store}
            styleOptions={styleOptions}
            locale="en-US"
          />
        ) : null}
      </div>
    </div>
  );
};
