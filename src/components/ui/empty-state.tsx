
import React from 'react';
import { LucideIcon } from 'lucide-react';
import { GlassmorphismButton } from './glassmorphism-button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionIcon?: LucideIcon;
  onAction?: () => void;
  variant?: 'gold' | 'green';
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionIcon,
  onAction,
  variant = 'gold'
}: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center fade-in">
      <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
        variant === 'gold' 
          ? 'bg-gradient-to-br from-gold-premium/20 to-gold-premium-light/20' 
          : 'bg-gradient-to-br from-green-dynamic/20 to-green-dynamic-dark/20'
      }`}>
        <Icon className={`w-10 h-10 ${
          variant === 'gold' ? 'text-gold-premium' : 'text-green-dynamic'
        }`} />
      </div>
      
      <h3 className="text-xl font-bold text-foreground mb-3">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-center max-w-sm mb-8">
        {description}
      </p>
      
      {actionText && onAction && (
        <GlassmorphismButton
          variant={variant}
          onClick={onAction}
          icon={actionIcon}
          size="lg"
        >
          {actionText}
        </GlassmorphismButton>
      )}
    </div>
  );
};
