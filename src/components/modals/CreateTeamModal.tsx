import React, { useState } from 'react';
import { X, Users, Mail, UserPlus } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTeamCreated: () => void;
  userId: string;
}

export const CreateTeamModal = ({ isOpen, onClose, onTeamCreated, userId }: CreateTeamModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    memberEmails: [''],
    inviteCode: ''
  });

  // Generate invite code when modal opens
  React.useEffect(() => {
    if (isOpen && !formData.inviteCode) {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      setFormData(prev => ({ ...prev, inviteCode: code }));
    }
  }, [isOpen]);
  const [loading, setLoading] = useState(false);

  const handleAddEmail = () => {
    setFormData(prev => ({
      ...prev,
      memberEmails: [...prev.memberEmails, '']
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      memberEmails: prev.memberEmails.map((email, i) => i === index ? value : email)
    }));
  };

  const handleRemoveEmail = (index: number) => {
    if (formData.memberEmails.length > 1) {
      setFormData(prev => ({
        ...prev,
        memberEmails: prev.memberEmails.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      // Create team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: formData.name.trim(),
          type: 'flexible', // Teams can play in different formats
          owner_id: userId
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add owner as team member
      const { error: memberError } = await supabase
        .from('team_members')
        .insert({
          team_id: team.id,
          user_id: userId,
          status: 'accepted',
          is_sub: false
        });

      if (memberError) throw memberError;

      // Add invited members
      const validEmails = formData.memberEmails.filter(email => email.trim());
      if (validEmails.length > 0) {
        for (const email of validEmails) {
          // For now, skip email invitations - this would require auth lookup
          // In a full implementation, you'd look up users by email

          // Email invitation logic would go here
        }
      }

      toast({
        title: "¡Equipo creado!",
        description: `${formData.name} ha sido creado exitosamente.`,
      });

      onTeamCreated();
      onClose();
      setFormData({ name: '', memberEmails: [''], inviteCode: '' });
    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el equipo. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-xl border">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-black-deep" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Crear Equipo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del equipo</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Los Cracks"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteCode">Código de invitación (opcional)</Label>
            <Input
              id="inviteCode"
              value={formData.inviteCode || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, inviteCode: e.target.value }))}
              placeholder="Genera un código único para invitar"
              readOnly
            />
            <p className="text-xs text-muted-foreground">
              Los jugadores pueden unirse usando este código
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Invitar jugadores (opcional)</Label>
              <button
                type="button"
                onClick={handleAddEmail}
                className="text-green-dynamic hover:text-green-dynamic-dark transition-colors flex items-center gap-1 text-sm"
              >
                <UserPlus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            
            {formData.memberEmails.map((email, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={email}
                  onChange={(e) => handleEmailChange(index, e.target.value)}
                  placeholder="email@ejemplo.com"
                  type="email"
                />
                {formData.memberEmails.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveEmail(index)}
                    className="w-10 h-10 rounded-lg hover:bg-red-500/20 flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-4">
            <GlassmorphismButton
              type="button"
              variant="default"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </GlassmorphismButton>
            <GlassmorphismButton
              type="submit"
              variant="gold"
              className="flex-1"
              disabled={loading || !formData.name.trim()}
              icon={loading ? undefined : Users}
            >
              {loading ? 'Creando...' : 'Crear Equipo'}
            </GlassmorphismButton>
          </div>
        </form>
      </div>
    </div>
  );
};