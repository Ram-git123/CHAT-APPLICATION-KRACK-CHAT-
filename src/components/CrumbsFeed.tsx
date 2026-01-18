import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send } from 'lucide-react';
import { Crumb } from '@/types/chat';
import { ImageUpload } from './ImageUpload';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface CrumbsFeedProps {
  crumbs: Crumb[];
  currentUserId: string;
  onPostCrumb: (content: string, imageUrl?: string) => void;
}

export const CrumbsFeed = ({ crumbs, currentUserId, onPostCrumb }: CrumbsFeedProps) => {
  const [newCrumb, setNewCrumb] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrumb.trim() && !imageUrl) return;
    onPostCrumb(newCrumb.trim(), imageUrl || undefined);
    setNewCrumb('');
    setImageUrl(null);
    setIsEditing(false);
  };

  const latestUserCrumb = crumbs.find(c => c.user_id === currentUserId);

  return (
    <aside className="w-72 bg-sidebar border-l border-sidebar-border flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <h2 className="font-display font-bold text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-gradient-biscuit">Crumbs</span>
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Post of the Day statuses</p>
      </div>

      {/* My Crumb Editor */}
      <div className="p-4 border-b border-sidebar-border">
        <AnimatePresence mode="wait">
          {isEditing ? (
            <motion.form
              key="editing"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-2"
            >
              {/* Image Preview/Upload */}
              <div className="flex items-center gap-2">
                <ImageUpload
                  userId={currentUserId}
                  onImageUploaded={setImageUrl}
                  onClear={() => setImageUrl(null)}
                  previewUrl={imageUrl}
                  compact
                />
                {!imageUrl && (
                  <span className="text-xs text-muted-foreground">Add a photo</span>
                )}
              </div>
              
              <Input
                value={newCrumb}
                onChange={(e) => setNewCrumb(e.target.value)}
                placeholder="What's your crumb today?"
                className="text-sm bg-input border-border"
                maxLength={100}
                autoFocus
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newCrumb.trim() && !imageUrl}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Post
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setImageUrl(null);
                    setNewCrumb('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          ) : (
            <motion.button
              key="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(true)}
              className="w-full p-3 rounded-xl bg-muted hover:bg-muted/80 transition-colors text-left"
            >
              <p className="text-xs text-muted-foreground mb-1">Your latest crumb:</p>
              <p className="text-sm font-medium truncate">
                {latestUserCrumb?.content || 'Click to post a crumb...'}
              </p>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Crumbs Feed */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-3">
        <AnimatePresence>
          {crumbs.map((crumb, i) => (
            <motion.div
              key={crumb.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card rounded-xl p-3 shadow-sm border border-border"
            >
              <div className="flex items-start gap-3">
                <img 
                  src={crumb.profile?.avatar_url || `https://api.dicebear.com/7.x/lorelei/svg?seed=unknown`} 
                  alt={crumb.profile?.username || 'User'}
                  className="w-8 h-8 rounded-full bg-muted flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-xs text-foreground truncate">
                      {crumb.user_id === currentUserId ? 'You' : crumb.profile?.username || 'Unknown'}
                    </p>
                    <span className="text-[10px] text-muted-foreground">
                      {format(new Date(crumb.created_at), 'HH:mm')}
                    </span>
                  </div>
                  
                  {/* Crumb Image */}
                  {crumb.image_url && (
                    <motion.img
                      src={crumb.image_url}
                      alt="Crumb image"
                      className="w-full rounded-lg mt-2 cursor-pointer max-h-32 object-cover"
                      whileHover={{ scale: 1.02 }}
                      onClick={() => window.open(crumb.image_url!, '_blank')}
                    />
                  )}
                  
                  {crumb.content && (
                    <p className="text-sm text-muted-foreground mt-0.5 break-words">
                      {crumb.content}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {crumbs.length === 0 && (
          <div className="text-center py-8">
            <Sparkles className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No crumbs yet today</p>
            <p className="text-xs text-muted-foreground mt-1">Be the first to drop one! 🍪</p>
          </div>
        )}
      </div>
    </aside>
  );
};
