import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import {
  getNotifications,
  getUnreadCount,
  markNotificationsRead,
  markAllNotificationsRead,
  deleteNotification,
  type Notification,
} from "../lib/api";

const POLL_INTERVAL = 30_000; // 30 seconds

export type NotificationFilter = "all" | "bookings" | "messages" | "payments" | "verification" | "matches" | "listings";

export function useNotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const tokenRef = useRef<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get auth token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (tokenRef.current) return tokenRef.current;
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token || null;
    tokenRef.current = token;
    return token;
  }, []);

  // Fetch unread count
  const refreshUnreadCount = useCallback(async () => {
    const token = await getToken();
    if (!token) return;
    const count = await getUnreadCount(token);
    setUnreadCount(count);
  }, [getToken]);

  // Fetch notifications
  const fetchNotifications = useCallback(
    async (showLoading = false) => {
      const token = await getToken();
      if (!token) return;

      if (showLoading) setLoading(true);

      const result = await getNotifications(token, {
        limit: 50,
        type: filter,
        unread_only: showUnreadOnly,
      });

      if (result) {
        setNotifications(result.notifications);
      }

      if (showLoading) setLoading(false);
    },
    [getToken, filter, showUnreadOnly]
  );

  // Mark single notification as read
  const markRead = useCallback(
    async (notificationId: string) => {
      const token = await getToken();
      if (!token) return;

      // Optimistic update
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));

      await markNotificationsRead(token, [notificationId]);
    },
    [getToken]
  );

  // Mark all as read
  const markAllRead = useCallback(async () => {
    const token = await getToken();
    if (!token) return;

    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);

    await markAllNotificationsRead(token);
  }, [getToken]);

  // Delete a notification
  const removeNotification = useCallback(
    async (notificationId: string) => {
      const token = await getToken();
      if (!token) return;

      const wasUnread = notifications.find((n) => n.id === notificationId && !n.is_read);

      // Optimistic update
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      if (wasUnread) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      await deleteNotification(token, notificationId);
    },
    [getToken, notifications]
  );

  // Reset token on auth change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      tokenRef.current = session?.access_token || null;
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch on mount and when filter changes
  useEffect(() => {
    fetchNotifications(true);
  }, [fetchNotifications]);

  // Poll unread count
  useEffect(() => {
    refreshUnreadCount();
    pollRef.current = setInterval(refreshUnreadCount, POLL_INTERVAL);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [refreshUnreadCount]);

  return {
    notifications,
    unreadCount,
    loading,
    filter,
    setFilter,
    showUnreadOnly,
    setShowUnreadOnly,
    markRead,
    markAllRead,
    removeNotification,
    refresh: () => {
      fetchNotifications(false);
      refreshUnreadCount();
    },
  };
}
