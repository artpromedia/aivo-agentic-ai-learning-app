import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextValue {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

interface NotificationProviderProps {
  children: ReactNode;
  maxNotifications?: number;
}

export function NotificationProvider({ 
  children, 
  maxNotifications = 5 
}: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id'>) => {
      const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };

      setNotifications((prev) => {
        const updated = [newNotification, ...prev];
        return updated.slice(0, maxNotifications);
      });

      // Auto-remove after duration
      const duration = newNotification.duration ?? 0;
      if (duration > 0) {
        setTimeout(() => {
          setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
      }
    },
    [maxNotifications]
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{ notifications, addNotification, removeNotification, clearAll }}
    >
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

// Notification Container Component
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

// Notification Card Component
interface NotificationCardProps {
  notification: Notification;
  onClose: () => void;
}

function NotificationCard({ notification, onClose }: NotificationCardProps) {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    error: 'bg-red-50 border-red-200 text-red-900',
  };

  const icons = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  };

  return (
    <div
      className={`
        p-4 rounded-xl border-2 shadow-lg 
        animate-slide-in-right
        ${typeStyles[notification.type]}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[notification.type]}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold mb-1">{notification.title}</div>
          {notification.message && (
            <div className="text-sm opacity-90">{notification.message}</div>
          )}
          {notification.action && (
            <button
              onClick={() => {
                notification.action?.onClick();
                onClose();
              }}
              className="mt-2 text-sm font-medium underline hover:no-underline"
            >
              {notification.action.label}
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-black/10 rounded transition"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// Convenience functions
export const notify = {
  info: (title: string, message?: string, action?: Notification['action']) => {
    return { type: 'info' as const, title, message, action };
  },
  success: (title: string, message?: string, action?: Notification['action']) => {
    return { type: 'success' as const, title, message, action };
  },
  warning: (title: string, message?: string, action?: Notification['action']) => {
    return { type: 'warning' as const, title, message, action };
  },
  error: (title: string, message?: string, action?: Notification['action']) => {
    return { type: 'error' as const, title, message, action };
  },
};
