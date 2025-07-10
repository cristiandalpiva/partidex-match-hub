import React, { useState, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users, MapPin } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminCalendarProps {
  userId: string;
}

export const AdminCalendar = ({ userId }: AdminCalendarProps) => {
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [matches, setMatches] = useState<any[]>([]);
  const [fields, setFields] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentDate, userId]);

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

      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          teams(name),
          fields!inner(name, id)
        `)
        .eq('fields.admin_id', userId)
        .gte('date_time', startOfWeek.toISOString())
        .lte('date_time', endOfWeek.toISOString())
        .order('date_time');

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

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-gold-premium" />
            <h2 className="text-xl font-bold text-foreground">Calendario Semanal</h2>
          </div>
          
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

                    return (
                      <div key={dayIndex} className="p-1 min-h-[60px] border border-border rounded hover:bg-muted/10 transition-colors">
                        {dayMatches.map((match, matchIndex) => (
                          <div
                            key={matchIndex}
                            className="p-2 mb-1 rounded bg-green-dynamic/20 border border-green-dynamic/30 text-xs hover-lift cursor-pointer"
                          >
                            <div className="font-medium text-foreground truncate">
                              {match.teams?.name || 'Partido'}
                            </div>
                            <div className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {match.fields?.name}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(match.date_time).toLocaleTimeString('es-ES', {
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Today's Summary */}
      <div className="glass rounded-3xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Resumen de Hoy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-border text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-green-dynamic" />
            <div className="text-2xl font-bold text-foreground">
              {getMatchesForDay(new Date()).length}
            </div>
            <div className="text-sm text-muted-foreground">Partidos hoy</div>
          </div>

          <div className="p-4 rounded-2xl border border-border text-center">
            <MapPin className="w-8 h-8 mx-auto mb-2 text-gold-premium" />
            <div className="text-2xl font-bold text-foreground">
              {fields.length}
            </div>
            <div className="text-sm text-muted-foreground">Canchas activas</div>
          </div>

          <div className="p-4 rounded-2xl border border-border text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-electric-blue" />
            <div className="text-2xl font-bold text-foreground">
              {getMatchesForDay(new Date()).reduce((total, match) => total + 10, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Jugadores esperados</div>
          </div>
        </div>
      </div>
    </div>
  );
};