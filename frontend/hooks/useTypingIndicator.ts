import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabase";

interface TypingState {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

/**
 * useTypingIndicator - Broadcasts and listens for typing status via Supabase Realtime.
 * Uses presence channels for ephemeral typing state (no DB writes).
 */
export function useTypingIndicator(
  currentUserId?: string,
  otherUserId?: string,
  currentUserName?: string
) {
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const broadcastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up typing indicator after 3 seconds of no broadcast
  const TYPING_TIMEOUT = 3000;
  // Debounce broadcast to avoid spamming
  const BROADCAST_DEBOUNCE = 800;

  useEffect(() => {
    if (!currentUserId || !otherUserId) return;

    const channelName = [currentUserId, otherUserId].sort().join(":");
    const channel = supabase.channel(`typing:${channelName}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "typing" }, (payload) => {
        const data = payload.payload as TypingState;
        if (data.userId === otherUserId && data.isTyping) {
          setIsOtherTyping(true);

          // Clear previous timeout
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => {
            setIsOtherTyping(false);
          }, TYPING_TIMEOUT);
        } else if (data.userId === otherUserId && !data.isTyping) {
          setIsOtherTyping(false);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  // Broadcast typing start (debounced)
  const broadcastTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;

    // Clear previous debounce
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: currentUserId,
        userName: currentUserName || "User",
        isTyping: true,
        timestamp: Date.now(),
      } as TypingState,
    });

    // Auto-stop after debounce period
    broadcastTimeoutRef.current = setTimeout(() => {
      channelRef.current?.send({
        type: "broadcast",
        event: "typing",
        payload: {
          userId: currentUserId,
          userName: currentUserName || "User",
          isTyping: false,
          timestamp: Date.now(),
        } as TypingState,
      });
    }, BROADCAST_DEBOUNCE);
  }, [currentUserId, currentUserName]);

  // Broadcast typing stop
  const stopTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;
    if (broadcastTimeoutRef.current) clearTimeout(broadcastTimeoutRef.current);

    channelRef.current.send({
      type: "broadcast",
      event: "typing",
      payload: {
        userId: currentUserId,
        userName: currentUserName || "User",
        isTyping: false,
        timestamp: Date.now(),
      } as TypingState,
    });
  }, [currentUserId, currentUserName]);

  return { isOtherTyping, broadcastTyping, stopTyping };
}
