import { createContext, useContext, ReactNode } from "react";
import { useToast, type Toast } from "@/components/NotificationToast";

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  success: (title: string, message?: string, duration?: number) => string;
  error: (title: string, message?: string, duration?: number) => string;
  warning: (title: string, message?: string, duration?: number) => string;
  info: (title: string, message?: string, duration?: number) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const toast = useToast();

  return (
    <ToastContext.Provider value={toast}>
      {children}
    </ToastContext.Provider>
  );
}

export function useGlobalToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useGlobalToast must be used within ToastProvider");
  }
  return context;
}
