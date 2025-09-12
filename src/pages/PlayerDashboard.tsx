
import React, { useState, useEffect } from 'react';
import { Plus, Calendar, Trophy, CreditCard, Users, MapPin, LogOut, Check, X, Bell, User, Menu } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { ScoreRing } from '@/components/ui/score-ring';
import { EmptyState } from '@/components/ui/empty-state';
import { AdBanner } from '@/components/AdBanner';
import { CreateTeamModal } from '@/components/modals/CreateTeamModal';
import { CreateMatchModal } from '@/components/modals/CreateMatchModal';
import { PaymentConfigModal } from '@/components/modals/PaymentConfigModal';
import { MatchDetailsModal } from '@/components/modals/MatchDetailsModal';
import { MyTeamsModal } from '@/components/modals/MyTeamsModal';
import { OnboardingFlow } from '@/components/OnboardingFlow';
import { NotificationPanel } from '@/components/NotificationPanel';
import { ProfilePage } from '@/components/ProfilePage';
import FieldSearch from '@/components/FieldSearch';
import { supabase } from '@/integrations/supabase/client';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [score, setScore] = useState(null);
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showCreateMatch, setShowCreateMatch] = useState(false);
  const [showPaymentConfig, setShowPaymentConfig] = useState(false);
  const [showMatchDetails, setShowMatchDetails] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showMyTeams, setShowMyTeams] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate('/login');
        return;
      }

      setUser(session.user);

      // Get user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', session.user.id)
        .single();

      if (profileData?.role !== 'player') {
        navigate('/admin/dashboard');
        return;
      }

      setProfile(profileData);

      // Check if onboarding is needed
      if (!profileData?.onboarding_completed) {
        setShowOnboarding(true);
      }

      // Load user data
      await Promise.all([
        loadUserTeams(session.user.id),
        loadUserMatches(session.user.id),
        loadUserScore(session.user.id)
      ]);

    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadUserTeams = async (userId: string) => {
    const { data } = await supabase
      .from('teams')
      .select(`
        *,
        team_members!inner(*)
      `)
      .eq('team_members.user_id', userId);
    
    if (data) setTeams(data);
  };

  const loadUserMatches = async (userId: string) => {
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        teams(name),
        fields(name, location),
        attendance!inner(status)
      `)
      .eq('attendance.user_id', userId)
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(5);
    
    if (data) setMatches(data);
  };

  const loadUserScore = async (userId: string) => {
    const { data } = await supabase
      .from('scores')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (data) setScore(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const handleCreateTeam = () => {
    setShowCreateTeam(true);
  };

  const handleCreateMatch = () => {
    setShowCreateMatch(true);
  };

  const handleTeamCreated = () => {
    loadUserTeams(user.id);
  };

  const handleMatchCreated = () => {
    loadUserMatches(user.id);
  };

  const handleAttendanceChange = async (matchId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('attendance')
        .update({ status })
        .eq('match_id', matchId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Reload matches to reflect the change
      loadUserMatches(user.id);
      
      toast({
        title: "Asistencia actualizada",
        description: `Has marcado tu asistencia como: ${status === 'confirmed' ? 'Confirmo' : status === 'declined' ? 'No asistiré' : 'Quizás'}`,
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu asistencia.",
        variant: "destructive"
      });
    }
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Reload profile to get updated data
    checkAuth();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                  alt="Partidex Logo" 
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Partidex</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">¡Hola, {profile?.name || 'Jugador'}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Menú hamburguesa (móvil y tablet) */}
              <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    aria-label="Abrir menú"
                    className="lg:hidden p-2 rounded-xl bg-muted border border-border text-foreground"
                  >
                    <Menu className="w-5 h-5" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[18rem] p-0">
                  <div className="p-4 space-y-2">
                    <h2 className="text-lg font-bold text-foreground mb-2">Menú</h2>
                    <GlassmorphismButton
                      variant="default"
                      size="sm"
                      icon={Bell}
                      className="w-full justify-start"
                      onClick={() => { setShowNotifications(true); setMenuOpen(false); }}
                    >
                      Notificaciones
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="default"
                      size="sm"
                      icon={User}
                      className="w-full justify-start"
                      onClick={() => { setShowProfile(true); setMenuOpen(false); }}
                    >
                      Perfil
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="gold"
                      size="sm"
                      icon={Plus}
                      className="w-full justify-start"
                      onClick={() => { handleCreateMatch(); setMenuOpen(false); }}
                    >
                      Crear Partido
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="gold"
                      size="sm"
                      icon={Users}
                      className="w-full justify-start"
                      onClick={() => { handleCreateTeam(); setMenuOpen(false); }}
                    >
                      Crear Equipo
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="default"
                      size="sm"
                      icon={CreditCard}
                      className="w-full justify-start"
                      onClick={() => { setShowPaymentConfig(true); setMenuOpen(false); }}
                    >
                      Gestionar Pagos
                    </GlassmorphismButton>
                    <GlassmorphismButton
                      variant="default"
                      size="sm"
                      icon={LogOut}
                      className="w-full justify-start"
                      onClick={() => { handleLogout(); setMenuOpen(false); }}
                    >
                      Salir
                    </GlassmorphismButton>
                  </div>
                </SheetContent>
              </Sheet>

              {/* Acciones escritorio */}
              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={Bell}
                onClick={() => setShowNotifications(true)}
                className="hidden md:flex"
              >
                Notificaciones
              </GlassmorphismButton>

              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={User}
                onClick={() => setShowProfile(true)}
                className="hidden lg:flex"
              >
                Perfil
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="gold"
                size="sm"
                icon={Plus}
                onClick={handleCreateMatch}
                className="hidden sm:flex"
              >
                Crear Partido
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="gold"
                size="sm"
                icon={Users}
                onClick={handleCreateTeam}
                className="hidden sm:flex"
              >
                Crear Equipo
              </GlassmorphismButton>

              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                <span className="hidden sm:inline">Salir</span>
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 pb-20 lg:pb-6">
        {showProfile ? (
          <ProfilePage 
            userId={user?.id} 
            onBack={() => setShowProfile(false)} 
          />
        ) : activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-8 fade-in">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Responsibility Score */}
              <div className="glass rounded-3xl p-4 sm:p-6 hover-lift">
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Score de Responsabilidad</h3>
                  <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-gold-premium" />
                </div>
                <div className="flex justify-center">
                  {score && score.total_games > 0 ? (
                    <ScoreRing score={score.score} size="md" />
                  ) : (
                    <div className="text-center p-2 sm:p-4">
                      <p className="text-muted-foreground text-xs sm:text-sm">
                        Tu Score de Responsabilidad aparecerá aquí una vez que hayas participado en partidos.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="glass rounded-3xl p-4 sm:p-6 hover-lift">
                <div className="space-y-3 sm:space-y-4">
                  <button 
                    className="flex items-center justify-between w-full text-left hover:bg-white/5 rounded-lg p-2 transition-colors"
                    onClick={() => setShowMyTeams(true)}
                  >
                    <span className="text-xs sm:text-sm text-muted-foreground">Equipos</span>
                    <span className="text-xl sm:text-2xl font-bold text-green-dynamic">{teams.length}</span>
                  </button>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Próximos partidos</span>
                    <span className="text-xl sm:text-2xl font-bold text-gold-premium">{matches.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Pagos pendientes</span>
                    <span className="text-xl sm:text-2xl font-bold text-intense-red">0</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="glass rounded-3xl p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
                <h3 className="font-semibold text-foreground mb-3 sm:mb-4 text-sm sm:text-base">Acciones Rápidas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-2 sm:gap-3">
                  <GlassmorphismButton
                    variant="gold"
                    size="sm"
                    icon={Plus}
                    onClick={handleCreateMatch}
                    className="w-full justify-start text-xs sm:text-sm"
                  >
                    Crear Partido
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    variant="gold"
                    size="sm"
                    icon={Users}
                    onClick={handleCreateTeam}
                    className="w-full justify-start text-xs sm:text-sm"
                  >
                    Crear Equipo
                  </GlassmorphismButton>
                  <GlassmorphismButton
                    variant="default"
                    size="sm"
                    icon={CreditCard}
                    className="w-full justify-start text-xs sm:text-sm"
                    onClick={() => setShowPaymentConfig(true)}
                  >
                    Gestionar Pagos
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

              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match: any, index) => {
                    const matchDate = new Date(match.date_time);
                    const attendanceStatus = match.attendance?.[0]?.status || 'maybe';
                    
                    return (
                      <div key={match.id} className={`p-4 rounded-2xl border transition-all hover-lift ${
                        attendanceStatus === 'confirmed' 
                          ? 'border-green-dynamic/30 bg-green-dynamic/5' 
                          : attendanceStatus === 'declined'
                          ? 'border-red-500/30 bg-red-500/5'
                          : 'border-vibrant-orange/30 bg-vibrant-orange/5'
                      } ${index === 0 ? 'slide-up' : ''}`}>
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full ${
                              attendanceStatus === 'confirmed' ? 'bg-green-dynamic' : 
                              attendanceStatus === 'declined' ? 'bg-red-500' :
                              'bg-vibrant-orange animate-pulse'
                            }`} />
                            <div>
                              <h3 className="font-semibold text-foreground">
                                {match.teams?.name || 'Equipo'}
                              </h3>
                              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  {matchDate.toLocaleDateString()} • {matchDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </span>
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  <span>{match.fields?.name || 'Campo'} - {match.fields?.location}</span>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">Estado:</span>
                                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                                  attendanceStatus === 'confirmed' ? 'bg-green-dynamic/20 text-green-dynamic' :
                                  attendanceStatus === 'declined' ? 'bg-red-500/20 text-red-500' :
                                  'bg-yellow-500/20 text-yellow-600'
                                }`}>
                                  {attendanceStatus === 'confirmed' ? 'Confirmado' :
                                   attendanceStatus === 'declined' ? 'No asistiré' : 'Pendiente'}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                            {/* Attendance buttons */}
                             <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1 sm:gap-2 w-full sm:w-auto">
                              <GlassmorphismButton
                                variant={attendanceStatus === 'confirmed' ? 'green' : 'default'}
                                size="sm"
                                icon={Check}
                                onClick={() => handleAttendanceChange(match.id, 'confirmed')}
                                className={`text-xs px-2 py-1 flex-1 sm:flex-none ${attendanceStatus === 'confirmed' ? 'bg-green-dynamic text-black-deep shadow-green' : 'text-black-deep bg-muted border-border'}`}
                              >
                                Asistiré
                              </GlassmorphismButton>
                              <GlassmorphismButton
                                variant="default"
                                size="sm"
                                icon={X}
                                onClick={() => handleAttendanceChange(match.id, 'declined')}
                                className={`text-xs px-2 py-1 flex-1 sm:flex-none ${attendanceStatus === 'declined' ? 'bg-red-500 text-white shadow-lg' : 'text-black-deep bg-muted border-border'}`}
                              >
                                No asistiré
                              </GlassmorphismButton>
                              <GlassmorphismButton
                                variant="default"
                                size="sm"
                                onClick={() => handleAttendanceChange(match.id, 'maybe')}
                                className={`text-xs px-2 py-1 flex-1 sm:flex-none ${attendanceStatus === 'maybe' ? 'bg-yellow-500 text-black-deep shadow-lg' : 'text-black-deep bg-muted border-border'}`}
                              >
                                Quizás
                              </GlassmorphismButton>
                            </div>
                            
                            <GlassmorphismButton 
                              variant="default" 
                              size="sm"
                              onClick={() => {
                                setSelectedMatch(match);
                                setShowMatchDetails(true);
                              }}
                              className="text-xs w-full sm:w-auto mt-2 sm:mt-0"
                            >
                              Ver detalles
                            </GlassmorphismButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  type="matches"
                  onAction={handleCreateMatch}
                />
              )}
            </div>

            {/* My Teams */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Mis Equipos</h2>
                <Users className="w-6 h-6 text-gold-premium" />
              </div>

                {teams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((team: any) => (
                    <div 
                      key={team.id} 
                      className="p-4 rounded-2xl border border-border hover-lift transition-all cursor-pointer"
                      onClick={() => setShowMyTeams(true)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">{team.name}</h3>
                        {team.owner_id === user?.id && (
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
                  type="teams"
                  onAction={handleCreateTeam}
                />
              )}
            </div>

            {/* Field Search */}
            <FieldSearch />

            {/* Advertising Banner */}
            <div className="mt-8">
              <AdBanner 
                location="dashboard" 
                className="rounded-2xl h-[150px] object-cover"
              />
            </div>
          </div>
        )}
      </main>

      {/* Modals and Panels */}
      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        userId={user?.id}
      />

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateTeam}
        onClose={() => setShowCreateTeam(false)}
        onTeamCreated={handleTeamCreated}
        userId={user?.id}
      />
      
      <CreateMatchModal
        isOpen={showCreateMatch}
        onClose={() => setShowCreateMatch(false)}
        onMatchCreated={handleMatchCreated}
        userId={user?.id}
      />

      <PaymentConfigModal
        isOpen={showPaymentConfig}
        onClose={() => setShowPaymentConfig(false)}
        userId={user?.id}
      />

      <MatchDetailsModal
        isOpen={showMatchDetails}
        onClose={() => setShowMatchDetails(false)}
        match={selectedMatch}
      />

      <MyTeamsModal
        isOpen={showMyTeams}
        onClose={() => setShowMyTeams(false)}
        userId={user?.id}
      />

      <OnboardingFlow
        isOpen={showOnboarding}
        onComplete={handleOnboardingComplete}
        userProfile={profile}
      />

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-lg border-t border-white/10 lg:hidden z-50">
        <div className="flex items-center justify-around py-2 px-2">
          {[
            { id: 'dashboard', icon: Trophy, label: 'Inicio', action: () => setActiveTab('dashboard') },
            { id: 'teams', icon: Users, label: 'Equipos', action: () => setShowMyTeams(true) },
            { id: 'create', icon: Plus, label: 'Crear', action: () => setShowCreateMatch(true) },
            { id: 'profile', icon: User, label: 'Perfil', action: () => setShowProfile(true) }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={tab.action}
              className={`flex flex-col items-center gap-1 px-2 py-2 rounded-xl transition-colors ${
                (activeTab === tab.id || (tab.id === 'profile' && showProfile))
                  ? 'bg-gold-premium text-black-deep shadow-gold'
                  : 'text-foreground hover:text-foreground hover:bg-muted/20'
              }`}
            >
              <tab.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default PlayerDashboard;
