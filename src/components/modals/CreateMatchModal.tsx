import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Clock, Users } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CreateMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMatchCreated: () => void;
  userId: string;
}

export const CreateMatchModal = ({ isOpen, onClose, onMatchCreated, userId }: CreateMatchModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    team_id: '',
    field_id: '',
    date: '',
    time: ''
  });
  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      loadTeams();
      loadFields();
    }
  }, [isOpen, userId]);

  const loadTeams = async () => {
    const { data } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(*)
      `)
      .eq('team_members.user_id', userId)
      .eq('team_members.status', 'accepted');
    
    if (data) setTeams(data);
  };

  const loadFields = async () => {
    const { data } = await supabase
      .from('fields')
      .select('*')
      .order('name');
    
    if (data) setFields(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.team_id || !formData.field_id || !formData.date || !formData.time) return;

    setLoading(true);
    try {
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          team_id: formData.team_id,
          field_id: formData.field_id,
          date_time: dateTime.toISOString(),
          created_by: userId,
          status: 'scheduled'
        })
        .select()
        .single();

      if (matchError) throw matchError;

      // Add attendance record for the creator
      const { error: attendanceError } = await supabase
        .from('attendance')
        .insert({
          match_id: match.id,
          user_id: userId,
          status: 'confirmed'
        });

      if (attendanceError) throw attendanceError;

      toast({
        title: "¡Partido creado!",
        description: "El partido ha sido programado exitosamente.",
      });

      onMatchCreated();
      onClose();
      setFormData({ team_id: '', field_id: '', date: '', time: '' });
    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "No se pudo crear el partido. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Get today's date in YYYY-MM-DD format for min date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Crear Partido</h2>
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
            <Label htmlFor="team">Seleccionar equipo</Label>
            <Select value={formData.team_id} onValueChange={(value) => setFormData(prev => ({ ...prev, team_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Elige tu equipo" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>{team.name} ({team.type})</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="field">Seleccionar cancha</Label>
            <Select value={formData.field_id} onValueChange={(value) => setFormData(prev => ({ ...prev, field_id: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Elige la cancha" />
              </SelectTrigger>
              <SelectContent>
                {fields.map((field) => (
                  <SelectItem key={field.id} value={field.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{field.name}</div>
                        <div className="text-xs text-muted-foreground">{field.location}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                min={today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input
                id="time"
                type="time"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                required
              />
            </div>
          </div>

          {teams.length === 0 && (
            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                Necesitas crear o unirte a un equipo antes de poder programar un partido.
              </p>
            </div>
          )}

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
              variant="green"
              className="flex-1"
              disabled={loading || !formData.team_id || !formData.field_id || !formData.date || !formData.time}
              icon={loading ? undefined : Calendar}
            >
              {loading ? 'Creando...' : 'Crear Partido'}
            </GlassmorphismButton>
          </div>
        </form>
      </div>
    </div>
  );
};