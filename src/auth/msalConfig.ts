import { Configuration, LogLevel } from "@azure/msal-browser";

export const msalConfig: Configuration = {
  auth: {
    clientId: "3c6a1f01-09c5-49c7-8be7-48c33e177432",
    authority:
      "https://login.microsoftonline.com/125ec668-dcca-47ba-9487-0304f441b3f1",
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          default:
            break;
        }
      },
    },
  },
};

export const loginRequest = {
  scopes: ["https://og-dv.crm.dynamics.com/.default"],
};

export const dataverseConfig = {
  baseUrl: "https://og-dv.crm.dynamics.com/api/data/v9.2",
};
