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
        <div className={styles.brandIcon}>OG</div>
        <Text size={700} weight="bold" block>
          O'G Central
        </Text>
        <Text
          size={400}
          style={{
            color: tokens.colorNeutralForeground3,
            display: "block",
            marginTop: 12,
          }}
        >
          Manage your accounts, activities, and action items — all in one place.
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
