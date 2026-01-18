import { motion } from 'framer-motion';
import { Profile } from '@/types/chat';
import { UserSidebar } from './UserSidebar';
import { ChatArea } from './ChatArea';
import { CrumbsFeed } from './CrumbsFeed';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';

interface ChatAppProps {
  profile: Profile;
  onLogout: () => void;
}

export const ChatApp = ({ profile, onLogout }: ChatAppProps) => {
  const {
    messages,
    profiles,
    crumbs,
    activeChat,
    setActiveChat,
    sendMessage,
    postCrumb,
    getPrivateMessages,
    findUserByChatId,
    loading
  } = useRealtimeChat(profile.user_id);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🍪
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-screen flex bg-background overflow-hidden"
    >
      {/* Left Sidebar - Users */}
      <UserSidebar 
        currentProfile={profile}
        profiles={profiles}
        onStartPrivateChat={(userId) => setActiveChat(userId)}
        onFindUserByChatId={findUserByChatId}
        onLogout={onLogout}
      />

      {/* Main Chat Area */}
      <ChatArea
        currentUserId={profile.user_id}
        currentUsername={profile.username}
        messages={messages}
        activeChat={activeChat}
        profiles={profiles}
        onSendMessage={sendMessage}
        onBackToPublic={() => setActiveChat('public')}
        getPrivateMessages={getPrivateMessages}
      />

      {/* Right Sidebar - Crumbs */}
      <CrumbsFeed
        crumbs={crumbs}
        currentUserId={profile.user_id}
        onPostCrumb={postCrumb}
      />
    </motion.div>
  );
};
