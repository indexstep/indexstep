"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[#aad94c]" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--red)]" />,
    info: <Info className="w-5 h-5 text-[var(--cyan)]" />,
  };

  const styles = {
    success: "bg-[#aad94c]/10 border-[#aad94c]/30",
    error: "bg-[var(--red)]/10 border-[var(--red)]/30",
    info: "bg-[var(--cyan)]/10 border-[var(--cyan)]/30",
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-fade-in ${styles[toast.type]}`}
          >
            {icons[toast.type]}
            <p className="text-sm text-[var(--text)]">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="ml-2 text-[var(--text-secondary)] hover:text-[var(--text)]">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
}
