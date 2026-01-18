import { useState, useRef } from 'react';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImageUploadProps {
  userId: string;
  onImageUploaded: (url: string) => void;
  onClear: () => void;
  previewUrl: string | null;
  compact?: boolean;
}

export const ImageUpload = ({ userId, onImageUploaded, onClear, previewUrl, compact = false }: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${userId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-media')
        .getPublicUrl(filePath);

      onImageUploaded(publicUrl);
      toast.success('Image uploaded!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (previewUrl) {
    return (
      <div className="relative inline-block">
        <img 
          src={previewUrl} 
          alt="Preview" 
          className={`rounded-lg object-cover border border-border ${compact ? 'w-12 h-12' : 'w-20 h-20'}`}
        />
        <button
          onClick={onClear}
          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-md hover:bg-destructive/90 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} rounded-xl hover:bg-muted`}
      >
        {uploading ? (
          <Loader2 className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} animate-spin text-muted-foreground`} />
        ) : (
          <ImagePlus className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-muted-foreground`} />
        )}
      </Button>
    </>
  );
};
