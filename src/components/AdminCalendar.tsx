import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCalendarProps {
  userId: string;
  selectedFieldId?: string | null;
}

export const AdminCalendar = ({ userId, selectedFieldId }: AdminCalendarProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedField, setSelectedField] = useState<string | null>(selectedFieldId || null);

  useEffect(() => {
    if (selectedFieldId) {
      setSelectedField(selectedFieldId);
    }
  }, [selectedFieldId]);

  useEffect(() => {
    loadData();
  }, [currentDate, userId, selectedField]);

  const loadData = async () => {
    try {
      // Load fields for this admin
      const { data: fieldsData } = await supabase
        .from('fields')
        .select('*')
        .eq('admin_id', userId);

      if (fieldsData) setFields(fieldsData);

      // Load matches for the current week
      const startOfWeek = getStartOfWeek(currentDate);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);

      let matchesQuery = supabase
        .from('matches')
        .select(`
          *,
          teams(name),
          fields!inner(name, id)
        `)
        .eq('fields.admin_id', userId)
        .gte('date_time', startOfWeek.toISOString())
        .lte('date_time', endOfWeek.toISOString());

      if (selectedField) {
        matchesQuery = matchesQuery.eq('field_id', selectedField);
      }

      const { data: matchesData } = await matchesQuery.order('date_time');

      if (matchesData) setMatches(matchesData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar el calendario.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStartOfWeek = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
  };

  const getWeekDays = () => {
    const startOfWeek = getStartOfWeek(currentDate);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getMatchesForDay = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    return matches.filter(match => {
      const matchDate = new Date(match.date_time);
      return matchDate >= dayStart && matchDate <= dayEnd;
    });
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const weekDays = getWeekDays();
  const timeSlots = Array.from({ length: 14 }, (_, i) => i + 6); // 6 AM to 7 PM

  if (loading) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted/20 rounded w-32"></div>
          <div className="h-64 bg-muted/20 rounded"></div>
        </div>
      </div>
    );
  }

  // Calculate available time slots
  const calculateAvailableSlots = () => {
    const today = new Date();
    const totalSlots = 16; // 6 AM to 10 PM
    
    if (selectedField) {
      const todayMatches = getMatchesForDay(today).filter(match => match.field_id === selectedField);
      return Math.max(0, totalSlots - todayMatches.length);
    } else {
      const todayMatches = getMatchesForDay(today);
      const fieldsWithMatches = new Set(todayMatches.map(match => match.field_id));
      const totalAvailableSlots = fields.reduce((total, field) => {
        const fieldMatches = todayMatches.filter(match => match.field_id === field.id);
        return total + Math.max(0, totalSlots - fieldMatches.length);
      }, 0);
      return totalAvailableSlots;
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gold-premium" />
            <h2 className="text-xl font-bold text-foreground">
              Calendario Semanal {selectedField && fields.find(f => f.id === selectedField)?.name && `- ${fields.find(f => f.id === selectedField)?.name}`}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={selectedField || ""}
              onChange={(e) => setSelectedField(e.target.value || null)}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/20 text-foreground text-sm"
            >
              <option value="">Todas las canchas</option>
              {fields.map((field: any) => (
                <option key={field.id} value={field.id}>{field.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div></div>
          
          <div className="flex items-center gap-2">
            <GlassmorphismButton
              variant="default"
              size="sm"
              icon={ChevronLeft}
              onClick={() => navigateWeek('prev')}
            >
              Anterior
            </GlassmorphismButton>
            <span className="px-4 py-2 text-sm font-medium text-foreground">
              {weekDays[0].toLocaleDateString('es-ES', { 
                month: 'long', 
                day: 'numeric' 
              })} - {weekDays[6].toLocaleDateString('es-ES', { 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
            <GlassmorphismButton
              variant="default"
              size="sm"
              icon={ChevronRight}
              onClick={() => navigateWeek('next')}
            >
              Siguiente
            </GlassmorphismButton>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-8 gap-1 mb-2">
              <div className="p-3 text-center font-medium text-muted-foreground">
                Hora
              </div>
              {weekDays.map((day, index) => (
                <div key={index} className="p-3 text-center">
                  <div className="font-medium text-foreground">
                    {day.toLocaleDateString('es-ES', { weekday: 'short' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            <div className="space-y-1">
              {timeSlots.map((hour) => (
                <div key={hour} className="grid grid-cols-8 gap-1">
                  <div className="p-2 text-center text-sm text-muted-foreground border border-border rounded">
                    {hour}:00
                  </div>
                   {weekDays.map((day, dayIndex) => {
                    const dayMatches = getMatchesForDay(day).filter(match => {
                      const matchHour = new Date(match.date_time).getHours();
                      return matchHour === hour;
                    });

                    const isBusinessHour = hour >= 6 && hour <= 22; // 6 AM to 10 PM
                    const isEmpty = dayMatches.length === 0;
                    const isPastDay = day < new Date();

                    return (
                      <div 
                        key={dayIndex} 
                        className={`p-1 min-h-[60px] border border-border rounded transition-colors ${
                          isEmpty && isBusinessHour && !isPastDay
                            ? 'bg-green-dynamic/5 hover:bg-green-dynamic/10 border-green-dynamic/20'
                            : isEmpty && isBusinessHour && isPastDay
                            ? 'bg-muted/5 border-muted/20'
                            : isEmpty
                            ? 'bg-muted/5 border-muted/10'
                            : 'hover:bg-muted/10'
                        }`}
                      >
                        {dayMatches.length > 0 ? (
                          dayMatches.map((match, matchIndex) => (
                            <div
                              key={matchIndex}
                              className="p-2 mb-1 rounded bg-gold-premium/20 border border-gold-premium/30 text-xs hover-lift cursor-pointer"
                            >
                              <div className="font-semibold text-foreground truncate">
                                {match.teams?.name || 'Partido'}
                              </div>
                              <div className="text-muted-foreground flex items-center gap-1 mb-1">
                                <MapPin className="w-3 h-3" />
                                <span className="font-medium">{match.fields?.name}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-gold-premium font-medium">
                                  {new Date(match.date_time).toLocaleTimeString('es-ES', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                <div className={`px-2 py-1 rounded text-xs font-medium ${
                                  match.status === 'confirmed' 
                                    ? 'bg-green-dynamic/20 text-green-dynamic'
                                    : 'bg-vibrant-orange/20 text-vibrant-orange'
                                }`}>
                                  {match.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          isBusinessHour && !isPastDay && (
                            <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                              <span className="text-green-dynamic font-medium">Disponible</span>
                            </div>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend and Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Legend */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Leyenda</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-gold-premium/20 border border-gold-premium/30"></div>
              <span className="text-sm text-foreground">Horario Reservado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-green-dynamic/5 border border-green-dynamic/20"></div>
              <span className="text-sm text-foreground">Horario Disponible</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded bg-muted/5 border border-muted/20"></div>
              <span className="text-sm text-foreground">Horario No Disponible</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-green-dynamic"></div>
              <span className="text-sm text-foreground">Partido Confirmado</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-vibrant-orange"></div>
              <span className="text-sm text-foreground">Partido Pendiente</span>
            </div>
          </div>
        </div>

        {/* Today's Summary */}
        <div className="glass rounded-3xl p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Resumen de Hoy</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="p-4 rounded-2xl border border-border text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-dynamic" />
              <div className="text-2xl font-bold text-foreground">
                {getMatchesForDay(new Date()).length}
              </div>
              <div className="text-sm text-muted-foreground">Partidos programados</div>
            </div>

            <div className="p-4 rounded-2xl border border-border text-center">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-gold-premium" />
              <div className="text-2xl font-bold text-foreground">
                {fields.length}
              </div>
              <div className="text-sm text-muted-foreground">Canchas disponibles</div>
            </div>

            <div className="p-4 rounded-2xl border border-border text-center">
              <Users className="w-8 h-8 mx-auto mb-2 text-electric-blue" />
              <div className="text-2xl font-bold text-foreground">
                {calculateAvailableSlots()}
              </div>
              <div className="text-sm text-muted-foreground">Horarios libres hoy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};