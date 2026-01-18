import { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import logo from '@/assets/krack-chat-logo.jpg';

interface LoginScreenProps {
  onSignUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  onSignIn: (email: string, password: string) => Promise<{ error: Error | null }>;
}

export const LoginScreen = ({ onSignUp, onSignIn }: LoginScreenProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (isSignUp && !username.trim()) return;

    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await onSignUp(email, password, username);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Account created! Welcome to Krack Chat! 🍪');
        }
      } else {
        const { error } = await onSignIn(email, password);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success('Welcome back, cracker! ⚡');
        }
      }
    } catch (err) {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background crumb-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-4 h-4 rounded-full bg-primary/20"
            initial={{ 
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800), 
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
              scale: 0.5 + Math.random() * 0.5
            }}
            animate={{ 
              y: [null, Math.random() * -200],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ 
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              repeatType: "reverse"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md px-6"
      >
        <div className="bg-card/80 backdrop-blur-xl rounded-3xl p-8 shadow-card border border-border">
          {/* Logo */}
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          >
            <div className="relative">
              <motion.img 
                src={logo}
                alt="Krack Chat"
                className="w-28 h-28 object-contain rounded-2xl"
                animate={{ rotate: [0, 2, -2, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                className="absolute -right-2 -top-2 bg-secondary rounded-full p-1.5"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Zap className="w-4 h-4 text-secondary-foreground" />
              </motion.div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-4xl font-display font-bold mb-2">
              <span className="text-gradient-biscuit">Krack</span>
              <span className="text-gradient-lightning"> Chat</span>
            </h1>
            <p className="text-muted-foreground text-sm">
              {isSignUp ? 'Create your cracker account' : 'Snap into conversations'} ⚡
            </p>
          </motion.div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-14 pl-12 text-lg bg-input border-2 border-border focus:border-primary rounded-xl font-medium placeholder:text-muted-foreground/50"
                    maxLength={20}
                  />
                </div>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 pl-12 text-lg bg-input border-2 border-border focus:border-primary rounded-xl font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 }}
            >
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-14 pl-12 text-lg bg-input border-2 border-border focus:border-primary rounded-xl font-medium placeholder:text-muted-foreground/50"
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                type="submit"
                disabled={!email.trim() || !password.trim() || (isSignUp && !username.trim()) || isLoading}
                className="w-full h-14 text-lg font-display font-semibold rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-biscuit transition-all duration-300 hover:shadow-lg disabled:opacity-50"
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    🍪
                  </motion.div>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    {isSignUp ? 'Create Account' : 'Start Crackin\''}
                  </>
                )}
              </Button>
            </motion.div>
          </form>

          {/* Toggle Sign Up / Sign In */}
          <motion.div 
            className="text-center mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
            </button>
          </motion.div>

          {/* Footer */}
          <motion.p 
            className="text-center text-xs text-muted-foreground mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            Your unique avatar will be generated automatically 🎨
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
