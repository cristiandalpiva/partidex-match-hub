
import React from 'react';
import { Shield, Zap, Users, Calendar } from 'lucide-react';
import { GlassmorphismButton } from './glassmorphism-button';

interface EmptyStateProps {
  type: 'teams' | 'matches' | 'tournaments';
  onAction?: () => void;
}

export const EmptyState = ({ type, onAction }: EmptyStateProps) => {
  const content = {
    teams: {
      icon: Shield,
      title: '¡Crea tu primer equipo!',
      description: 'Forma tu equipo, invita jugadores y comienza a organizar partidos épicos.',
      actionText: 'Crear Equipo',
      variant: 'gold' as const,
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-gold-premium/20 to-gold-premium-light/20 rounded-full animate-pulse" />
          <Shield className="w-16 h-16 text-gold-premium absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-gold-premium to-gold-premium-light rounded-full flex items-center justify-center">
            <Users className="w-4 h-4 text-black-deep" />
          </div>
        </div>
      )
    },
    matches: {
      icon: Zap,
      title: '¡Organiza tu primer partido!',
      description: 'Elige tu equipo, reserva cancha y convoca a los jugadores para el partido.',
      actionText: 'Crear Partido',
      variant: 'green' as const,
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-green-dynamic/20 to-green-dynamic-dark/20 rounded-full animate-pulse" />
          <Zap className="w-16 h-16 text-green-dynamic absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-dynamic to-green-dynamic-dark rounded-full flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
        </div>
      )
    },
    tournaments: {
      icon: Calendar,
      title: 'Torneos próximamente',
      description: 'Estamos preparando una experiencia increíble para los torneos. ¡Mantente atento!',
      actionText: 'Notificarme',
      variant: 'default' as const,
      illustration: (
        <div className="relative w-32 h-32 mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40 rounded-full animate-pulse" />
          <Calendar className="w-16 h-16 text-muted-foreground absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      )
    }
  };

  const { icon: Icon, title, description, actionText, variant, illustration } = content[type];

  return (
    <div className="text-center py-12 px-6">
      {illustration}
      
      <h3 className="text-2xl font-bold text-foreground mb-3 animate-fade-in">
        {title}
      </h3>
      
      <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in">
        {description}
      </p>
      
      {onAction && (
        <GlassmorphismButton
          variant={variant}
          size="lg"
          icon={Icon}
          onClick={onAction}
          className="animate-bounce-in"
        >
          {actionText}
        </GlassmorphismButton>
      )}
    </div>
  );
};
