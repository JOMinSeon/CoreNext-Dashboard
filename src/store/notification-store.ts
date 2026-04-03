import { create } from "zustand"

export type NotificationType = "info" | "warning" | "error" | "success"

export interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  link?: string
  read: boolean
  createdAt: string
  dueDate?: string
}

interface NotificationStore {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  deleteNotification: (id: string) => void
  getUnreadCount: () => number
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        {
          ...notification,
          id: Date.now().toString(),
          read: false,
          createdAt: new Date().toISOString(),
        },
        ...state.notifications,
      ],
    })),
  markAsRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),
  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
  deleteNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
  getUnreadCount: () => get().notifications.filter((n) => !n.read).length,
}))
