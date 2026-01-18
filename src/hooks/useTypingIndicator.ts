import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  id: string;
  username: string;
}

export const useTypingIndicator = (userId: string | undefined, chatId: 'public' | string, username: string) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!userId) return;

    const channelName = chatId === 'public' ? 'typing:public' : `typing:${[userId, chatId].sort().join('-')}`;
    
    const channel = supabase.channel(channelName, {
      config: { presence: { key: userId } }
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typingList: TypingUser[] = [];
        
        Object.entries(state).forEach(([key, presences]) => {
          if (key !== userId && presences.length > 0) {
            const presence = presences[0] as any;
            if (presence.isTyping) {
              typingList.push({ id: key, username: presence.username });
            }
          }
        });
        
        setTypingUsers(typingList);
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [userId, chatId]);

  const setTyping = useCallback((isTyping: boolean) => {
    if (!channelRef.current || !userId) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    channelRef.current.track({ isTyping, username });

    // Auto-stop typing after 3 seconds
    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        channelRef.current?.track({ isTyping: false, username });
      }, 3000);
    }
  }, [userId, username]);

  const startTyping = useCallback(() => setTyping(true), [setTyping]);
  const stopTyping = useCallback(() => setTyping(false), [setTyping]);

  return { typingUsers, startTyping, stopTyping };
};
