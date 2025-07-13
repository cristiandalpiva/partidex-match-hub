import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Trophy, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface MyTeamsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

interface Team {
  id: string;
  name: string;
  type: string;
  owner_id: string;
  created_at: string;
  team_members?: any[];
}

interface TeamDetails {
  players: any[];
  matches: any[];
  stats: {
    totalGames: number;
    wins: number;
    losses: number;
  };
}

export const MyTeamsModal = ({ isOpen, onClose, userId }: MyTeamsModalProps) => {
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teamDetails, setTeamDetails] = useState<TeamDetails | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadTeams();
    }
  }, [isOpen, userId]);

  const loadTeams = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          team_members!inner(
            user_id,
            status,
            is_sub
          )
        `)
        .eq('team_members.user_id', userId);

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los equipos.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadTeamDetails = async (team: Team) => {
    setLoading(true);
    try {
      // Load team members
      const { data: membersData } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .eq('team_id', team.id);

      // Load team matches
      const { data: matchesData } = await supabase
        .from('matches')
        .select(`
          *,
          fields(name, location),
          attendance(status, user_id)
        `)
        .eq('team_id', team.id)
        .order('date_time', { ascending: false });

      setTeamDetails({
        players: membersData || [],
        matches: matchesData || [],
        stats: {
          totalGames: matchesData?.length || 0,
          wins: 0, // This would need match results
          losses: 0
        }
      });

      setSelectedTeam(team);
    } catch (error) {
      console.error('Error loading team details:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del equipo.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedTeam(null);
    setTeamDetails(null);
    onClose();
  };

  const handleBackToTeams = () => {
    setSelectedTeam(null);
    setTeamDetails(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="glass max-w-4xl max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedTeam && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToTeams}
                className="mr-2"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <Users className="w-5 h-5 text-gold-premium" />
            {selectedTeam ? selectedTeam.name : 'Mis Equipos'}
          </DialogTitle>
        </DialogHeader>

        {!selectedTeam ? (
          // Teams List View
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Cargando equipos...</p>
              </div>
            ) : teams.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {teams.map((team) => (
                  <div 
                    key={team.id}
                    className="p-4 rounded-xl border border-border hover:border-primary/50 transition-all cursor-pointer hover-lift"
                    onClick={() => loadTeamDetails(team)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-foreground">{team.name}</h3>
                      {team.owner_id === userId && (
                        <Badge variant="outline" className="text-gold-premium border-gold-premium/50">
                          Capitán
                        </Badge>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Modalidad:</span>
                        <span className="text-foreground font-medium">{team.type}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Miembros:</span>
                        <span className="text-foreground font-medium">
                          {team.team_members?.length || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No perteneces a ningún equipo aún.</p>
              </div>
            )}
          </div>
        ) : (
          // Team Details View
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-2">Cargando detalles...</p>
              </div>
            ) : teamDetails && (
              <>
                {/* Team Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Partidos Jugados</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{teamDetails.stats.totalGames}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <Trophy className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">Victorias</span>
                    </div>
                    <p className="text-2xl font-bold text-green-500">{teamDetails.stats.wins}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Efectividad</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {teamDetails.stats.totalGames > 0 
                        ? Math.round((teamDetails.stats.wins / teamDetails.stats.totalGames) * 100) 
                        : 0}%
                    </p>
                  </div>
                </div>

                {/* Team Players */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Jugadores ({teamDetails.players.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {teamDetails.players.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {member.profiles?.name?.charAt(0) || 'J'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{member.profiles?.name || 'Jugador'}</p>
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={member.status === 'active' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {member.status === 'active' ? 'Activo' : 'Pendiente'}
                            </Badge>
                            {member.is_sub && (
                              <Badge variant="outline" className="text-xs">
                                Suplente
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Matches */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-4">Historial de Partidos</h3>
                  {teamDetails.matches.length > 0 ? (
                    <div className="space-y-3">
                      {teamDetails.matches.slice(0, 5).map((match) => (
                        <div key={match.id} className="p-4 rounded-lg border border-border">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-foreground">
                                vs {match.fields?.name || 'Campo no especificado'}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(match.date_time).toLocaleDateString()} • {match.fields?.location}
                              </p>
                            </div>
                            <Badge 
                              variant={match.status === 'completed' ? 'default' : 'secondary'}
                            >
                              {match.status === 'completed' ? 'Completado' : 'Programado'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-4">
                      No hay partidos registrados para este equipo.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};