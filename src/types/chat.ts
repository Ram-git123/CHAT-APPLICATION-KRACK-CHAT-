export interface User {
  id: string;
  user_id: string;
  username: string;
  avatar: string;
  chat_id: string;
  isOnline: boolean;
  crumb?: string;
  last_seen?: string;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id?: string | null;
  content: string;
  image_url?: string | null;
  is_private: boolean;
  created_at: string;
  // Joined fields
  sender?: {
    username: string;
    avatar_url: string;
    chat_id: string;
  };
}

export interface Crumb {
  id: string;
  user_id: string;
  content: string;
  image_url?: string | null;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string;
  };
}

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  chat_id: string;
  avatar_url: string;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}
