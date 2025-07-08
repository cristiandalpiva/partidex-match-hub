
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface GlassmorphismButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'gold' | 'green' | 'default';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const GlassmorphismButton = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  icon: Icon,
  disabled = false,
  className = '',
  type = 'button'
}: GlassmorphismButtonProps) => {
  const baseClasses = 'glass rounded-2xl font-semibold transition-all duration-300 hover-lift tap-scale flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    gold: 'bg-gradient-to-r from-gold-premium to-gold-premium-light text-black-deep shadow-gold hover:shadow-xl',
    green: 'bg-gradient-to-r from-green-dynamic to-green-dynamic-dark text-white shadow-green hover:shadow-xl',
    default: 'text-foreground hover:bg-white/10'
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};
