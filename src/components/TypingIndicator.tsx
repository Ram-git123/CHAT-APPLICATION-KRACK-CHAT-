import { motion } from 'framer-motion';

interface TypingIndicatorProps {
  typingUsers: { id: string; username: string }[];
}

export const TypingIndicator = ({ typingUsers }: TypingIndicatorProps) => {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].username} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].username} and ${typingUsers[1].username} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground"
    >
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ 
              y: [0, -4, 0],
              opacity: [0.4, 1, 0.4]
            }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.8, 
              delay: i * 0.15,
              ease: "easeInOut"
            }}
            className="w-1.5 h-1.5 bg-primary rounded-full"
          />
        ))}
      </div>
      <span>{getTypingText()}</span>
    </motion.div>
  );
};
