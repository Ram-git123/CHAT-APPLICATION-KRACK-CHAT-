import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Hash, Lock, ArrowLeft, Zap } from 'lucide-react';
import { Message, Profile } from '@/types/chat';
import { ChatBubble } from './ChatBubble';
import { TypingIndicator } from './TypingIndicator';
import { ImageUpload } from './ImageUpload';
import { useTypingIndicator } from '@/hooks/useTypingIndicator';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ChatAreaProps {
  currentUserId: string;
  currentUsername: string;
  messages: Message[];
  activeChat: 'public' | string;
  profiles: Profile[];
  onSendMessage: (content: string, receiverId?: string, imageUrl?: string) => void;
  onBackToPublic: () => void;
  getPrivateMessages: (userId: string) => Promise<Message[]>;
}

export const ChatArea = ({
  currentUserId,
  currentUsername,
  messages,
  activeChat,
  profiles,
  onSendMessage,
  onBackToPublic,
  getPrivateMessages,
}: ChatAreaProps) => {
  const [inputValue, setInputValue] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [privateMessages, setPrivateMessages] = useState<Message[]>([]);
  const [loadingPrivate, setLoadingPrivate] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const isPublic = activeChat === 'public';
  const recipient = !isPublic ? profiles.find(p => p.user_id === activeChat) : null;
  const displayMessages = isPublic ? messages : privateMessages;

  const { typingUsers, startTyping, stopTyping } = useTypingIndicator(
    currentUserId,
    activeChat,
    currentUsername
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load private messages when switching to private chat
  useEffect(() => {
    if (!isPublic && activeChat) {
      setLoadingPrivate(true);
      getPrivateMessages(activeChat).then((msgs) => {
        setPrivateMessages(msgs);
        setLoadingPrivate(false);
      });
    }
  }, [activeChat, isPublic, getPrivateMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [displayMessages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    if (e.target.value) {
      startTyping();
    } else {
      stopTyping();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() && !imageUrl) return;
    
    stopTyping();
    onSendMessage(inputValue.trim(), isPublic ? undefined : activeChat, imageUrl || undefined);
    setInputValue('');
    setImageUrl(null);

    // Optimistically add to private messages
    if (!isPublic) {
      const newMsg: Message = {
        id: Date.now().toString(),
        sender_id: currentUserId,
        receiver_id: activeChat,
        content: inputValue.trim(),
        image_url: imageUrl,
        is_private: true,
        created_at: new Date().toISOString(),
        sender: profiles.find(p => p.user_id === currentUserId) as any
      };
      setPrivateMessages(prev => [...prev, newMsg]);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background">
      {/* Chat Header */}
      <header className="h-16 px-6 flex items-center justify-between border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {!isPublic && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onBackToPublic}
              className="mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          )}
          
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isPublic ? 'bg-primary/20' : 'bg-secondary/20'}`}>
            {isPublic ? (
              <Hash className="w-5 h-5 text-primary" />
            ) : (
              <Lock className="w-5 h-5 text-secondary" />
            )}
          </div>
          
          <div>
            <h2 className="font-display font-semibold text-foreground">
              {isPublic ? 'Public Room' : `SnapSession with ${recipient?.username}`}
            </h2>
            <p className="text-xs text-muted-foreground">
              {isPublic 
                ? `${profiles.filter(p => p.is_online).length} crackers online`
                : `Chat ID: ${recipient?.chat_id || 'Private conversation'}`
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-secondary animate-pulse" />
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-2">
        {loadingPrivate ? (
          <div className="flex items-center justify-center h-full">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="text-4xl"
            >
              🍪
            </motion.div>
          </div>
        ) : displayMessages.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              {isPublic ? (
                <Hash className="w-10 h-10 text-primary" />
              ) : (
                <Lock className="w-10 h-10 text-secondary" />
              )}
            </div>
            <h3 className="font-display font-semibold text-lg mb-2">
              {isPublic ? 'Welcome to the cracker zone! 🍪' : 'Start your SnapSession! ⚡'}
            </h3>
            <p className="text-muted-foreground text-sm">
              {isPublic 
                ? 'Be the first to crack open a conversation!'
                : `Send a private message to ${recipient?.username}`
              }
            </p>
          </motion.div>
        ) : (
          <>
            {displayMessages.map((message) => (
              <ChatBubble 
                key={message.id} 
                message={message} 
                isOwn={message.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <TypingIndicator typingUsers={typingUsers} />
        )}
      </AnimatePresence>

      {/* Message Input */}
      <form 
        onSubmit={handleSubmit}
        className="p-4 border-t border-border bg-card/50 backdrop-blur-sm"
      >
        {/* Image Preview */}
        {imageUrl && (
          <div className="mb-3">
            <ImageUpload
              userId={currentUserId}
              onImageUploaded={setImageUrl}
              onClear={() => setImageUrl(null)}
              previewUrl={imageUrl}
            />
          </div>
        )}
        
        <div className="flex gap-3 items-center">
          <ImageUpload
            userId={currentUserId}
            onImageUploaded={setImageUrl}
            onClear={() => setImageUrl(null)}
            previewUrl={null}
          />
          <Input
            value={inputValue}
            onChange={handleInputChange}
            onBlur={stopTyping}
            placeholder={isPublic ? "Drop a crumb..." : "Send a snap..."}
            className="flex-1 h-12 bg-input border-2 border-border focus:border-primary rounded-xl px-4"
            maxLength={500}
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() && !imageUrl}
            className="h-12 w-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-biscuit disabled:opacity-50 disabled:shadow-none transition-all"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
};
