import { toast as sonnerToast } from 'sonner';

export interface ToastProps {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export const useToast = () => {
  const toast = ({ title, description, variant = 'default' }: ToastProps) => {
    if (variant === 'destructive') {
      sonnerToast.error(title || 'Error', {
        description,
      });
    } else {
      sonnerToast.success(title || 'Success', {
        description,
      });
    }
  };

  return { toast };
};

export { sonnerToast as toast };
