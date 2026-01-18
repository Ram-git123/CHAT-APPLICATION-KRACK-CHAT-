import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, MessageCircle, Zap, Search, LogOut } from 'lucide-react';
import { useState } from 'react';
import { Profile } from '@/types/chat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface UserSidebarProps {
  currentProfile: Profile;
  profiles: Profile[];
  onStartPrivateChat: (userId: string) => void;
  onFindUserByChatId: (chatId: string) => Profile | undefined;
  onLogout: () => void;
}

export const UserSidebar = ({ 
  currentProfile, 
  profiles, 
  onStartPrivateChat,
  onFindUserByChatId,
  onLogout 
}: UserSidebarProps) => {
  const [copied, setCopied] = useState(false);
  const [searchId, setSearchId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const copyId = () => {
    navigator.clipboard.writeText(currentProfile.chat_id);
    setCopied(true);
    toast.success('Chat ID copied! Share it to start a SnapSession ⚡');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSearchUser = () => {
    if (!searchId.trim()) return;
    
    const foundUser = onFindUserByChatId(searchId.trim());
    if (foundUser) {
      if (foundUser.user_id === currentProfile.user_id) {
        toast.error("That's your own Chat ID, cracker! 🍪");
        return;
      }
      onStartPrivateChat(foundUser.user_id);
      setSearchId('');
      setIsSearching(false);
      toast.success(`Starting SnapSession with ${foundUser.username}! ⚡`);
    } else {
      toast.error('User not found. Check the Chat ID and try again.');
    }
  };

  const otherProfiles = profiles.filter(p => p.user_id !== currentProfile.user_id);
  const onlineProfiles = otherProfiles.filter(p => p.is_online);
  const offlineProfiles = otherProfiles.filter(p => !p.is_online);

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col h-full">
      {/* Current User Card */}
      <div className="p-4 border-b border-sidebar-border">
        <motion.div 
          className="bg-card rounded-2xl p-4 shadow-card"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="relative">
              <img 
                src={currentProfile.avatar_url} 
                alt={currentProfile.username}
                className="w-12 h-12 rounded-full bg-muted ring-2 ring-primary ring-offset-2 ring-offset-card"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-card" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-foreground truncate">
                {currentProfile.username}
              </h3>
              <p className="text-xs text-muted-foreground font-mono truncate">
                ID: {currentProfile.chat_id}
              </p>
            </div>
          </div>
          
          <Button
            onClick={copyId}
            variant="outline"
            size="sm"
            className="w-full gap-2 bg-muted hover:bg-muted/80 border-border text-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                Copy My Chat ID
              </>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Search by Chat ID */}
      <div className="p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {isSearching ? (
            <motion.div
              key="search-input"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2"
            >
              <Input
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Chat ID..."
                className="text-sm bg-input border-border font-mono"
                onKeyDown={(e) => e.key === 'Enter' && handleSearchUser()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  onClick={handleSearchUser}
                  size="sm"
                  className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
                >
                  <Search className="w-3 h-3 mr-1" />
                  Find
                </Button>
                <Button
                  onClick={() => { setIsSearching(false); setSearchId(''); }}
                  size="sm"
                  variant="outline"
                >
                  Cancel
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="search-button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Button
                onClick={() => setIsSearching(true)}
                variant="outline"
                className="w-full gap-2 border-secondary/50 text-secondary hover:bg-secondary/10"
              >
                <Search className="w-4 h-4" />
                Search by Chat ID
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Users List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Online ({onlineProfiles.length})
          </h4>
          <AnimatePresence>
            {onlineProfiles.map((profile, i) => (
              <motion.div
                key={profile.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="group mb-2"
              >
                <button
                  onClick={() => onStartPrivateChat(profile.user_id)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors"
                >
                  <div className="relative">
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.username}
                      className="w-10 h-10 rounded-full bg-muted"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-medium text-sm text-sidebar-foreground truncate">
                      {profile.username}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {profile.chat_id}
                    </p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {offlineProfiles.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Offline ({offlineProfiles.length})
            </h4>
            {offlineProfiles.map((profile) => (
              <button
                key={profile.user_id}
                onClick={() => onStartPrivateChat(profile.user_id)}
                className="w-full flex items-center gap-3 p-2 rounded-xl opacity-50 hover:opacity-75 transition-opacity"
              >
                <img 
                  src={profile.avatar_url} 
                  alt={profile.username}
                  className="w-10 h-10 rounded-full bg-muted grayscale"
                />
                <div className="flex-1 min-w-0 text-left">
                  <p className="font-medium text-sm text-sidebar-foreground truncate">
                    {profile.username}
                  </p>
                  <p className="text-xs text-muted-foreground font-mono truncate">
                    {profile.chat_id}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Logout & Branding */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <Button
          onClick={onLogout}
          variant="ghost"
          size="sm"
          className="w-full gap-2 text-muted-foreground hover:text-destructive"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
          <Zap className="w-4 h-4 text-secondary" />
          <span className="text-xs font-display">Krack Chat</span>
        </div>
      </div>
    </aside>
  );
};
