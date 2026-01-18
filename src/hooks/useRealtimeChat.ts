import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message, Profile, Crumb } from '@/types/chat';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

export const useRealtimeChat = (userId: string | undefined) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [crumbs, setCrumbs] = useState<Crumb[]>([]);
  const [activeChat, setActiveChat] = useState<'public' | string>('public');
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setLoading(true);
      
      // Fetch all profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (profilesData) {
        setProfiles(profilesData as Profile[]);
      }

      // Fetch public messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: true })
        .limit(100);
      
      if (messagesData && profilesData) {
        // Manually join sender info
        const messagesWithSender = messagesData.map(msg => ({
          ...msg,
          sender: profilesData.find(p => p.user_id === msg.sender_id)
            ? {
                username: profilesData.find(p => p.user_id === msg.sender_id)!.username,
                avatar_url: profilesData.find(p => p.user_id === msg.sender_id)!.avatar_url,
                chat_id: profilesData.find(p => p.user_id === msg.sender_id)!.chat_id
              }
            : undefined
        }));
        setMessages(messagesWithSender as Message[]);
      }

      // Fetch crumbs
      const { data: crumbsData } = await supabase
        .from('crumbs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (crumbsData && profilesData) {
        // Manually join profile info
        const crumbsWithProfile = crumbsData.map(crumb => ({
          ...crumb,
          profile: profilesData.find(p => p.user_id === crumb.user_id)
            ? {
                username: profilesData.find(p => p.user_id === crumb.user_id)!.username,
                avatar_url: profilesData.find(p => p.user_id === crumb.user_id)!.avatar_url
              }
            : undefined
        }));
        setCrumbs(crumbsWithProfile as Crumb[]);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId]);

  // Realtime subscriptions
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('realtime-chat')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          const newMessage = payload.new;
          
          // Fetch sender info
          const { data: sender } = await supabase
            .from('profiles')
            .select('username, avatar_url, chat_id')
            .eq('user_id', newMessage.sender_id)
            .single();
          
          const messageWithSender = { 
            ...newMessage, 
            sender: sender || undefined 
          };
          
          // Only add to messages if it's public or involves current user
          if (!newMessage.is_private || 
              newMessage.sender_id === userId || 
              newMessage.receiver_id === userId) {
            setMessages(prev => [...prev, messageWithSender as Message]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles' },
        (payload: RealtimePostgresChangesPayload<any>) => {
          if (payload.eventType === 'INSERT') {
            setProfiles(prev => [...prev, payload.new as Profile]);
          } else if (payload.eventType === 'UPDATE') {
            setProfiles(prev => 
              prev.map(p => p.user_id === (payload.new as Profile).user_id ? payload.new as Profile : p)
            );
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'crumbs' },
        async (payload: RealtimePostgresChangesPayload<any>) => {
          const newCrumb = payload.new;
          
          // Fetch profile info
          const { data: profile } = await supabase
            .from('profiles')
            .select('username, avatar_url')
            .eq('user_id', newCrumb.user_id)
            .single();
          
          setCrumbs(prev => [{ ...newCrumb, profile: profile || undefined } as Crumb, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Send message
  const sendMessage = useCallback(async (content: string, receiverId?: string, imageUrl?: string) => {
    if (!userId || (!content.trim() && !imageUrl)) return;

    const { error } = await supabase
      .from('messages')
      .insert({
        sender_id: userId,
        receiver_id: receiverId || null,
        content: content.trim(),
        image_url: imageUrl || null,
        is_private: !!receiverId
      });

    if (error) {
      console.error('Error sending message:', error);
    }
  }, [userId]);

  // Post crumb
  const postCrumb = useCallback(async (content: string, imageUrl?: string) => {
    if (!userId || (!content.trim() && !imageUrl)) return;

    const { error } = await supabase
      .from('crumbs')
      .insert({
        user_id: userId,
        content: content.trim(),
        image_url: imageUrl || null
      });

    if (error) {
      console.error('Error posting crumb:', error);
    }
  }, [userId]);

  // Get private messages between current user and another user
  const getPrivateMessages = useCallback(async (otherUserId: string): Promise<Message[]> => {
    if (!userId) return [];

    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('is_private', true)
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });

    if (!data) return [];

    // Manually join sender info
    const messagesWithSender = await Promise.all(data.map(async (msg) => {
      const { data: sender } = await supabase
        .from('profiles')
        .select('username, avatar_url, chat_id')
        .eq('user_id', msg.sender_id)
        .single();
      
      return { ...msg, sender: sender || undefined };
    }));

    return messagesWithSender as Message[];
  }, [userId]);

  // Find user by chat ID
  const findUserByChatId = useCallback((chatId: string) => {
    return profiles.find(p => p.chat_id.toLowerCase() === chatId.toLowerCase());
  }, [profiles]);

  // Get public messages
  const publicMessages = messages.filter(m => !m.is_private);

  return {
    messages: publicMessages,
    profiles,
    crumbs,
    activeChat,
    setActiveChat,
    sendMessage,
    postCrumb,
    getPrivateMessages,
    findUserByChatId,
    loading
  };
};
