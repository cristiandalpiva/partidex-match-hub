
import React from 'react';

interface ScoreRingProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ScoreRing = ({ score, size = 'md', showLabel = true }: ScoreRingProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 90) return '#FFD700'; // Gold
    if (score >= 70) return '#00C851'; // Green
    if (score >= 50) return '#FF6F00'; // Orange
    return '#FF1744'; // Red
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

  const scoreColor = getScoreColor(score);
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`relative ${sizeClasses[size]} flex items-center justify-center`}>
        {/* Background Circle */}
        <svg className="absolute inset-0 w-full h-full transform -rotate-90">
          <circle
            cx="50%"
            cy="50%"
            r="40"
            stroke="currentColor"
            strokeWidth="6"
            fill="transparent"
            className="text-muted/20"
          />
          {/* Progress Circle */}
          <circle
            cx="50%"
            cy="50%"
            r="40"
            stroke={scoreColor}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
            style={{
              filter: 'drop-shadow(0 0 6px rgba(255, 215, 0, 0.4))'
            }}
          />
        </svg>
        
        {/* Score Text */}
        <div className="flex flex-col items-center">
          <span 
            className={`font-bold ${textSizeClasses[size]}`}
            style={{ color: scoreColor }}
          >
            {score}
          </span>
        </div>
      </div>
      
      {showLabel && (
        <div className="text-center">
          <div 
            className={`font-semibold ${labelSizeClasses[size]}`}
            style={{ color: scoreColor }}
          >
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
