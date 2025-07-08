
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Users, TrendingUp, Clock, LogOut } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { EmptyState } from '@/components/ui/empty-state';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fields, setFields] = useState([]);
  const [matches, setMatches] = useState([]);

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

      if (profileData?.role !== 'admin') {
        navigate('/player/dashboard');
        return;
      }

      setProfile(profileData);

      // Load admin data
      await Promise.all([
        loadAdminFields(session.user.id),
        loadTodayMatches(session.user.id)
      ]);

    } catch (error) {
      console.error('Auth error:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadAdminFields = async (userId: string) => {
    const { data } = await supabase
      .from('fields')
      .select('*')
      .eq('admin_id', userId);
    
    if (data) setFields(data);
  };

  const loadTodayMatches = async (userId: string) => {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
    
    const { data } = await supabase
      .from('matches')
      .select(`
        *,
        teams(name),
        fields!inner(name)
      `)
      .eq('fields.admin_id', userId)
      .gte('date_time', startOfDay.toISOString())
      .lt('date_time', endOfDay.toISOString())
      .order('date_time', { ascending: true });
    
    if (data) setMatches(data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-premium/5 via-background to-green-dynamic/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-black-deep" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Partidex Admin</h1>
                <p className="text-sm text-muted-foreground">¡Hola, {profile?.name || 'Admin'}!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <GlassmorphismButton
                variant="gold"
                size="sm"
                icon={MapPin}
              >
                Nueva Cancha
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="green"
                size="sm"
                icon={Calendar}
              >
                Bloquear Horario
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 fade-in">
            {/* Today's Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Ingresos Hoy</h3>
                  <DollarSign className="w-5 h-5 text-green-dynamic" />
                </div>
                <p className="text-2xl font-bold text-green-dynamic">
                  {formatCurrency(0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">+15% vs ayer</p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Reservas</h3>
                  <Calendar className="w-5 h-5 text-gold-premium" />
                </div>
                <p className="text-2xl font-bold text-gold-premium">
                  {matches.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +0 nuevas
                </p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Ocupación</h3>
                  <TrendingUp className="w-5 h-5 text-electric-blue" />
                </div>
                <p className="text-2xl font-bold text-electric-blue">
                  85%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Promedio general</p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Canchas Activas</h3>
                  <MapPin className="w-5 h-5 text-vibrant-orange" />
                </div>
                <p className="text-2xl font-bold text-vibrant-orange">
                  {fields.length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Operativas</p>
              </div>
            </div>

            {/* Field Performance */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Rendimiento por Cancha</h2>
                <MapPin className="w-6 h-6 text-gold-premium" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {fields.map((field: any, index) => (
                  <div key={field.id} className={`p-6 rounded-2xl border border-border hover-lift transition-all ${
                    index === 0 ? 'slide-up' : ''
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">{field.name}</h3>
                        <p className="text-sm text-muted-foreground">{field.location}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        field.occupancy >= 90 
                          ? 'bg-green-dynamic/20 text-green-dynamic' 
                          : field.occupancy >= 70
                          ? 'bg-gold-premium/20 text-gold-premium'
                          : 'bg-vibrant-orange/20 text-vibrant-orange'
                      }`}>
                        {field.occupancy}% ocupación
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Reservas hoy</p>
                        <p className="text-xl font-bold text-foreground">{field.todayReservations}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Ingresos</p>
                        <p className="text-xl font-bold text-green-dynamic">
                          {formatCurrency(field.revenue)}
                        </p>
                      </div>
                    </div>

                    {/* Occupancy Bar */}
                    <div className="mt-4">
                      <div className="w-full bg-muted/20 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-700 ${
                            field.occupancy >= 90 
                              ? 'bg-gradient-to-r from-green-dynamic to-neon-green' 
                              : field.occupancy >= 70
                              ? 'bg-gradient-to-r from-gold-premium to-gold-premium-light'
                              : 'bg-gradient-to-r from-vibrant-orange to-intense-red'
                          }`}
                          style={{ width: `${field.occupancy}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Schedule */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Agenda de Hoy</h2>
                <Clock className="w-6 h-6 text-gold-premium" />
              </div>

              {matches.length > 0 ? (
                <div className="space-y-4">
                  {matches.map((match: any, index) => (
                    <div key={match.id} className={`p-4 rounded-2xl border transition-all hover-lift border-green-dynamic/30 bg-green-dynamic/5 ${index === 0 ? 'slide-up' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-3 h-3 rounded-full bg-green-dynamic" />
                          <div>
                            <h3 className="font-semibold text-foreground">{match.teams?.name || 'Equipo'}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{new Date(match.date_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} • 2h</span>
                              <span>{match.fields?.name || 'Cancha'}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <GlassmorphismButton variant="default" size="sm">
                            Detalles
                          </GlassmorphismButton>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={Calendar}
                  title="No hay reservas para hoy"
                  description="Las reservas de hoy aparecerán aquí. Puedes crear horarios disponibles o bloquear tiempo de mantenimiento."
                  actionText="Gestionar Horarios"
                  actionIcon={Clock}
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
            { id: 'dashboard', icon: TrendingUp, label: 'Dashboard' },
            { id: 'calendar', icon: Calendar, label: 'Agenda' },
            { id: 'fields', icon: MapPin, label: 'Canchas' },
            { id: 'payments', icon: DollarSign, label: 'Pagos' }
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

export default AdminDashboard;
