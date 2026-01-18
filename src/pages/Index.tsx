import { AnimatePresence, motion } from 'framer-motion';
import { LoginScreen } from '@/components/LoginScreen';
import { ChatApp } from '@/components/ChatApp';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, profile, loading, signUp, signIn, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
    <AnimatePresence mode="wait">
      {!user || !profile ? (
        <motion.div
          key="login"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.3 }}
        >
          <LoginScreen 
            onSignUp={signUp} 
            onSignIn={signIn}
          />
        </motion.div>
      ) : (
        <motion.div
          key="chat"
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChatApp profile={profile} onLogout={signOut} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Index;
