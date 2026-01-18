import { motion } from 'framer-motion';
import { Message } from '@/types/chat';
import { format } from 'date-fns';

interface ChatBubbleProps {
  message: Message;
  isOwn: boolean;
}

export const ChatBubble = ({ message, isOwn }: ChatBubbleProps) => {
  const senderName = message.sender?.username || 'Unknown';
  const senderAvatar = message.sender?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=unknown`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      className={`flex items-end gap-2 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <motion.img
        src={senderAvatar}
        alt={senderName}
        className="w-8 h-8 rounded-full bg-muted flex-shrink-0"
        whileHover={{ scale: 1.1 }}
      />

      {/* Message Content */}
      <div className={`max-w-[70%] ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
        {!isOwn && (
          <span className="text-xs text-muted-foreground mb-1 ml-2">
            {senderName}
          </span>
        )}
        
        <motion.div
          className={`px-4 py-3 ${isOwn ? 'bubble-own' : 'bubble-other'}`}
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          {/* Image */}
          {message.image_url && (
            <motion.img
              src={message.image_url}
              alt="Shared image"
              className="max-w-full rounded-lg mb-2 cursor-pointer"
              style={{ maxHeight: '200px' }}
              whileHover={{ scale: 1.05 }}
              onClick={() => window.open(message.image_url!, '_blank')}
            />
          )}
          
          {message.content && (
            <p className="text-sm leading-relaxed break-words">{message.content}</p>
          )}
        </motion.div>
        
        <span className={`text-xs text-muted-foreground mt-1 ${isOwn ? 'mr-2' : 'ml-2'}`}>
          {format(new Date(message.created_at), 'h:mm a')}
        </span>
      </div>
    </motion.div>
  );
};
