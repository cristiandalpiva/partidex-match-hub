
import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ScoreRing = ({ score, size = 'md', showLabel = true, className = '' }: ScoreRingProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-gold-premium';
    if (score >= 70) return 'text-neon-green';
    if (score >= 50) return 'text-vibrant-orange';
    return 'text-intense-red';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 90) return 'from-gold-premium to-gold-premium-light';
    if (score >= 70) return 'from-neon-green to-green-dynamic';
    if (score >= 50) return 'from-vibrant-orange to-yellow-400';
    return 'from-intense-red to-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Élite';
    if (score >= 70) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Bajo';
  };

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const radius = size === 'sm' ? 30 : size === 'md' ? 40 : 50;
  const strokeWidth = size === 'sm' ? 4 : size === 'md' ? 6 : 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center group hover-lift`}>
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r={radius}
            stroke="url(#scoreGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" className={getScoreGradient(score).split(' ')[0].replace('from-', '')} />
              <stop offset="100%" className={getScoreGradient(score).split(' ')[1].replace('to-', '')} />
            </linearGradient>
          </defs>
        </svg>
        
        {/* Score Text */}
        <div className="flex flex-col items-center">
          <span className={`font-bold ${textSizeClasses[size]} ${getScoreColor(score)}`}>
            {score}
          </span>
        </div>
        
        {/* Hover Effect */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {showLabel && (
        <div className="text-center">
          <div className={`font-semibold ${labelSizeClasses[size]} ${getScoreColor(score)}`}>
            {getScoreLabel(score)}
          </div>
          <div className={`text-muted-foreground ${size === 'sm' ? 'text-xs' : 'text-sm'}`}>
            Responsabilidad
          </div>
        </div>
      )}
    </div>
  );
};
