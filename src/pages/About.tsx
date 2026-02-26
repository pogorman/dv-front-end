import React from "react";
import {
  makeStyles,
  shorthands,
  Card,
  Text,
  Subtitle1,
  Caption1,
  tokens,
  Divider,
} from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    maxWidth: "720px",
  },
  card: {
    ...shorthands.padding("24px"),
    ...shorthands.borderRadius("8px"),
    border: `1px solid ${tokens.colorNeutralStroke1}`,
    boxShadow: "none",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    ...shorthands.padding("6px", "0"),
  },
  label: {
    color: tokens.colorNeutralForeground3,
    minWidth: "160px",
    fontFamily: tokens.fontFamilyMonospace,
    fontSize: "12px",
  },
});

export const About: React.FC = () => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <Subtitle1 style={{ marginBottom: "4px" }}>boom!</Subtitle1>
        <Caption1 style={{ color: tokens.colorNeutralForeground3 }}>
          Internal business management tool
        </Caption1>

        <Divider style={{ margin: "16px 0" }} />

        <div className={styles.row}>
          <Text className={styles.label}>Platform</Text>
          <Text>React SPA on Azure Static Web Apps</Text>
        </div>
        <div className={styles.row}>
          <Text className={styles.label}>Backend</Text>
          <Text>Microsoft Dataverse Web API</Text>
        </div>
        <div className={styles.row}>
          <Text className={styles.label}>Authentication</Text>
          <Text>Azure AD (MSAL)</Text>
        </div>
        <div className={styles.row}>
          <Text className={styles.label}>UI Framework</Text>
          <Text>Fluent UI v9</Text>
        </div>
        <div className={styles.row}>
          <Text className={styles.label}>Domain</Text>
          <Text>ohgeesolutions.com</Text>
        </div>
      </Card>
    </div>
  );
};
