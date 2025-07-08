
import React from 'react';
import { Plus, Calendar, Trophy, CreditCard, Users, MapPin } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { ScoreRing } from '@/components/ui/score-ring';
import { EmptyState } from '@/components/ui/empty-state';

const PlayerDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  // Mock data
  const playerData = {
    name: 'Carlos Martínez',
    responsabilityScore: 85,
    upcomingMatches: [
      {
        id: 1,
        teamName: 'Los Tigres',
        date: '2024-01-15',
        time: '19:00',
        field: 'Cancha Central',
        confirmed: true
      },
      {
        id: 2,
        teamName: 'Amigos FC',
        date: '2024-01-18',
        time: '20:30',
        field: 'La Bombonera',
        confirmed: false
      }
    ],
    teams: [
      {
        id: 1,
        name: 'Los Tigres',
        type: '11 vs 11',
        members: 18,
        isOwner: true
      }
    ],
    pendingPayments: 2
  };

  const handleCreateTeam = () => {
    console.log('Creating team...');
  };

  const handleCreateMatch = () => {
    console.log('Creating match...');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-black-deep" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Partidex</h1>
                <p className="text-sm text-muted-foreground">¡Hola, {playerData.name}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <GlassmorphismButton
                variant="green"
                size="sm"
                icon={Plus}
                onClick={handleCreateMatch}
              >
                Partido
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="gold"
                size="sm"
                icon={Users}
                onClick={handleCreateTeam}
              >
                Equipo
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Responsibility Score */}
              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">Score de Responsabilidad</h3>
                  <Trophy className="w-5 h-5 text-gold-premium" />
                </div>
                <div className="flex justify-center">
                  <ScoreRing score={playerData.responsabilityScore} size="md" />
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Equipos</span>
                    <span className="text-2xl font-bold text-green-dynamic">{playerData.teams.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Próximos partidos</span>
                    <span className="text-2xl font-bold text-gold-premium">{playerData.upcomingMatches.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pagos pendientes</span>
                    <span className="text-2xl font-bold text-intense-red">{playerData.pendingPayments}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass rounded-3xl p-6">
                <h3 className="font-semibold text-foreground mb-4">Acciones Rápidas</h3>
                <div className="space-y-3">
                  <GlassmorphismButton
                    variant="green"
                    size="sm"
                    icon={Plus}
                    onClick={handleCreateMatch}
                    className="w-full justify-start"
                  >
                    Crear Partido
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    variant="gold"
                    size="sm"
                    icon={Users}
                    onClick={handleCreateTeam}
                    className="w-full justify-start"
                  >
                    Crear Equipo
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    variant="default"
                    size="sm"
                    icon={CreditCard}
                    className="w-full justify-start"
                  >
                    Ver Pagos
                  </GlassmorphismButton>
                </div>
              </div>
            </div>

            {/* Upcoming Matches */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Próximos Partidos</h2>
                <Calendar className="w-6 h-6 text-gold-premium" />
              </div>

              {playerData.upcomingMatches.length > 0 ? (
                <div className="space-y-4">
                  {playerData.upcomingMatches.map((match, index) => (
                    <div key={match.id} className={`p-4 rounded-2xl border transition-all hover-lift ${
                      match.confirmed 
                        ? 'border-green-dynamic/30 bg-green-dynamic/5' 
                        : 'border-vibrant-orange/30 bg-vibrant-orange/5'
                    } ${index === 0 ? 'slide-up' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            match.confirmed ? 'bg-green-dynamic' : 'bg-vibrant-orange animate-pulse'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-foreground">{match.teamName}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{match.date} • {match.time}</span>
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                <span>{match.field}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!match.confirmed && (
                            <GlassmorphismButton variant="green" size="sm">
                              Confirmar
                            </GlassmorphismButton>
                          )}
                          <GlassmorphismButton variant="default" size="sm">
                            Ver detalles
                          </GlassmorphismButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No tienes partidos próximos"
                  description="Crea un nuevo partido o únete a uno existente para comenzar a jugar"
                  actionText="Crear Partido"
                  actionIcon={Plus}
                  onAction={handleCreateMatch}
                  variant="green"
                />
              )}
            </div>

            {/* My Teams */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Mis Equipos</h2>
                <Users className="w-6 h-6 text-gold-premium" />
              </div>

              {playerData.teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {playerData.teams.map((team) => (
                    <div key={team.id} className="p-4 rounded-2xl border border-border hover-lift transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{team.name}</h3>
                        {team.isOwner && (
                          <div className="px-2 py-1 bg-gold-premium/20 text-gold-premium text-xs rounded-lg font-medium">
                            Capitán
                          </div>
                        )}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Modalidad:</span>
                          <span className="text-foreground font-medium">{team.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Miembros:</span>
                          <span className="text-foreground font-medium">{team.members}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Users}
                  title="No tienes equipos"
                  description="Crea tu primer equipo y comienza a invitar amigos para jugar juntos"
                  actionText="Crear Equipo"
                  actionIcon={Plus}
                  onAction={handleCreateTeam}
                  variant="gold"
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 md:hidden">
        <div className="flex items-center justify-around py-2">
          {[
            { id: 'dashboard', icon: Trophy, label: 'Inicio' },
            { id: 'teams', icon: Users, label: 'Equipos' },
            { id: 'matches', icon: Calendar, label: 'Partidos' },
            { id: 'payments', icon: CreditCard, label: 'Pagos' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-colors ${
                activeTab === tab.id
                  ? 'text-gold-premium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default PlayerDashboard;
