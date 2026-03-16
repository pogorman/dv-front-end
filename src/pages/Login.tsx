import React from "react";
import {
  makeStyles,
  shorthands,
  tokens,
  Button,
  Text,
  Card,
} from "@fluentui/react-components";
import { ShieldLock24Regular } from "@fluentui/react-icons";
import { useMsal } from "@azure/msal-react";
import { loginRequest } from "../auth/msalConfig";

const useStyles = makeStyles({
  root: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#0a0c10",
  },
  card: {
    ...shorthands.padding("48px"),
    ...shorthands.borderRadius("8px"),
    maxWidth: "420px",
    width: "100%",
    textAlign: "center",
    border: `1px solid #252a36`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
  },
  brandIcon: {
    width: "64px",
    height: "64px",
    ...shorthands.borderRadius("8px"),
    backgroundColor: "#4a9eff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 24px auto",
    color: "white",
    fontWeight: "bold",
    fontSize: "24px",
  },
  signInButton: {
    marginTop: "32px",
    minWidth: "200px",
    height: "44px",
  },
});

export const LoginPage: React.FC = () => {
  const styles = useStyles();
  const { instance } = useMsal();

  const handleLogin = () => {
    instance.loginRedirect(loginRequest);
  };

  return (
    <div className={styles.root}>
      <Card className={styles.card}>
        <div className={styles.brandIcon}>
          <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" style={{ width: "40px", height: "40px" }}>
            <path d="M32 8 C28 16 25 26 25 38 L39 38 C39 26 36 16 32 8Z" fill="white"/>
            <circle cx="32" cy="26" r="4" fill="#4a9eff"/>
            <path d="M25 34 L17 44 L25 40Z" fill="white" opacity="0.85"/>
            <path d="M39 34 L47 44 L39 40Z" fill="white" opacity="0.85"/>
            <rect x="27" y="38" width="10" height="3" rx="1" fill="rgba(255,255,255,0.7)"/>
            <path d="M28 41 L32 54 L36 41Z" fill="#f59e0b"/>
            <path d="M30 41 L32 50 L34 41Z" fill="#f87171"/>
          </svg>
        </div>
        <Text size={700} weight="bold" block>
          My Work
        </Text>
        <Text
          size={400}
          style={{
            color: tokens.colorNeutralForeground3,
            display: "block",
            marginTop: 12,
          }}
        >
          Manage your accounts, activities, and tasks — all in one place.
        </Text>
        <Button
          className={styles.signInButton}
          appearance="primary"
          size="large"
          icon={<ShieldLock24Regular />}
          onClick={handleLogin}
        >
          Sign in with Microsoft
        </Button>
      </Card>
    </div>
  );
};
