import React, { createContext, useContext, useCallback } from "react";
import {
  Toaster,
  useToastController,
  useId,
  Toast,
  ToastTitle,
  ToastBody,
  ToastIntent,
} from "@fluentui/react-components";

interface NotificationContextValue {
  notify: (title: string, body?: string, intent?: ToastIntent) => void;
}

const NotificationContext = createContext<NotificationContextValue>({
  notify: () => {},
});

export const useNotification = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const toasterId = useId("app-toaster");
  const { dispatchToast } = useToastController(toasterId);

  const notify = useCallback(
    (title: string, body?: string, intent: ToastIntent = "success") => {
      dispatchToast(
        <Toast>
          <ToastTitle>{title}</ToastTitle>
          {body && <ToastBody>{body}</ToastBody>}
        </Toast>,
        { intent, timeout: intent === "error" ? 5000 : 3000 }
      );
    },
    [dispatchToast]
  );

  return (
    <NotificationContext.Provider value={{ notify }}>
      {children}
      <Toaster toasterId={toasterId} position="top-end" />
    </NotificationContext.Provider>
  );
};
