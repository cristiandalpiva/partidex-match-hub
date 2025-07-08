
import React from 'react';
import { Shield, Users } from 'lucide-react';

interface RoleSelectorProps {
  selectedRole: 'player' | 'admin' | null;
  onRoleSelect: (role: 'player' | 'admin') => void;
}

export const RoleSelector = ({ selectedRole, onRoleSelect }: RoleSelectorProps) => {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      <button
        type="button"
        onClick={() => onRoleSelect('player')}
        className={`p-6 rounded-2xl border-2 transition-all duration-300 hover-lift tap-scale ${
          selectedRole === 'player'
            ? 'border-green-dynamic bg-green-dynamic/10 shadow-green'
            : 'border-border hover:border-green-dynamic/50'
        }`}
      >
        <Users className={`w-8 h-8 mx-auto mb-3 ${
          selectedRole === 'player' ? 'text-green-dynamic' : 'text-muted-foreground'
        }`} />
        <div className="text-center">
          <h3 className={`font-semibold mb-1 ${
            selectedRole === 'player' ? 'text-green-dynamic' : 'text-foreground'
          }`}>
            Jugador
          </h3>
          <p className="text-xs text-muted-foreground">
            Organiza partidos y únete a equipos
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onRoleSelect('admin')}
        className={`p-6 rounded-2xl border-2 transition-all duration-300 hover-lift tap-scale ${
          selectedRole === 'admin'
            ? 'border-gold-premium bg-gold-premium/10 shadow-gold'
            : 'border-border hover:border-gold-premium/50'
        }`}
      >
        <Shield className={`w-8 h-8 mx-auto mb-3 ${
          selectedRole === 'admin' ? 'text-gold-premium' : 'text-muted-foreground'
        }`} />
        <div className="text-center">
          <h3 className={`font-semibold mb-1 ${
            selectedRole === 'admin' ? 'text-gold-premium' : 'text-foreground'
          }`}>
            Admin de Cancha
          </h3>
          <p className="text-xs text-muted-foreground">
            Gestiona canchas y reservas
          </p>
        </div>
      </button>
    </div>
  );
};
