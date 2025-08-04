
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, DollarSign, Users, TrendingUp, Clock, LogOut } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { EmptyState } from '@/components/ui/empty-state';
import { AdBanner } from '@/components/AdBanner';
import { AddFieldModal } from '@/components/modals/AddFieldModal';
import { PaymentModal } from '@/components/modals/PaymentModal';
import { AdminCalendar } from '@/components/AdminCalendar';
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
  const [showAddField, setShowAddField] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [selectedField, setSelectedField] = useState<string | null>(null);

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
        fields!inner(name, id),
        payments(amount, status)
      `)
      .eq('fields.admin_id', userId)
      .gte('date_time', startOfDay.toISOString())
      .lt('date_time', endOfDay.toISOString())
      .order('date_time', { ascending: true });
    
    if (data) setMatches(data);
  };

  const calculateTodayRevenue = () => {
    return matches.reduce((total, match) => {
      const payment = match.payments?.[0];
      if (payment && payment.status === 'completed') {
        return total + (parseFloat(payment.amount) || 0);
      }
      return total;
    }, 0);
  };

  const calculateFieldStats = (fieldId: string) => {
    const fieldMatches = matches.filter(match => match.field_id === fieldId);
    const todayReservations = fieldMatches.length;
    const revenue = fieldMatches.reduce((total, match) => {
      const payment = match.payments?.[0];
      if (payment && payment.status === 'completed') {
        return total + (parseFloat(payment.amount) || 0);
      }
      return total;
    }, 0);
    
    // Calculate available time slots for today (6 AM to 10 PM = 16 hours)
    const totalSlots = 16;
    const occupiedSlots = fieldMatches.length;
    const freeSlots = Math.max(0, totalSlots - occupiedSlots);
    
    return {
      todayReservations,
      revenue,
      freeSlots
    };
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

  const handleAddField = () => {
    setShowAddField(true);
  };

  const handleFieldAdded = () => {
    loadAdminFields(user.id);
  };

  const handlePaymentModal = (payment: any) => {
    setSelectedPayment(payment);
    setShowPaymentModal(true);
  };

  const handlePaymentUpdated = () => {
    loadTodayMatches(user.id);
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
                onClick={handleAddField}
              >
                Nueva Cancha
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="gold"
                size="sm"
                icon={Calendar}
                onClick={() => setActiveTab('calendar')}
              >
                Ver Agenda
              </GlassmorphismButton>

              <GlassmorphismButton
                variant="default"
                size="sm"
                onClick={() => toast({
                  title: "Próximamente",
                  description: "La promoción de canchas estará disponible muy pronto",
                })}
              >
                Promocionar Cancha
              </GlassmorphismButton>

              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={LogOut}
                onClick={handleLogout}
              >
                Salir
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === 'calendar' && (
          <AdminCalendar userId={user?.id} selectedFieldId={selectedField} />
        )}
        
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
                  {formatCurrency(calculateTodayRevenue())}
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
                  <h3 className="text-sm font-medium text-muted-foreground">Horarios Libres</h3>
                  <Clock className="w-5 h-5 text-electric-blue" />
                </div>
                <p className="text-2xl font-bold text-electric-blue">
                  {fields.reduce((total, field) => total + calculateFieldStats(field.id).freeSlots, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Disponibles hoy</p>
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

            {/* Next Week's Stats */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Resumen Semana Próxima</h2>
                <div className="text-sm text-muted-foreground">
                  {(() => {
                    const nextWeek = new Date();
                    nextWeek.setDate(nextWeek.getDate() + 7);
                    const startNextWeek = new Date(nextWeek);
                    startNextWeek.setDate(startNextWeek.getDate() - nextWeek.getDay() + 1);
                    const endNextWeek = new Date(startNextWeek);
                    endNextWeek.setDate(endNextWeek.getDate() + 6);
                    return `${startNextWeek.toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short' 
                    })} - ${endNextWeek.toLocaleDateString('es-ES', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}`;
                  })()}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass rounded-3xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Partidos Programados</h3>
                    <Calendar className="w-5 h-5 text-gold-premium" />
                  </div>
                  <p className="text-2xl font-bold text-gold-premium">0</p>
                  <p className="text-xs text-muted-foreground mt-1">Próxima semana</p>
                </div>

                <div className="glass rounded-3xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Canchas Disponibles</h3>
                    <MapPin className="w-5 h-5 text-vibrant-orange" />
                  </div>
                  <p className="text-2xl font-bold text-vibrant-orange">{fields.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">Operativas</p>
                </div>

                <div className="glass rounded-3xl p-6 hover-lift">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-muted-foreground">Horarios Libres</h3>
                    <Clock className="w-5 h-5 text-electric-blue" />
                  </div>
                  <p className="text-2xl font-bold text-electric-blue">
                    {fields.length * 16 * 7}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Total semanal</p>
                </div>
              </div>
            </div>

            {/* Field Performance */}
            <div className="glass rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground">Rendimiento por Cancha</h2>
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
                  <GlassmorphismButton
                    variant="gold"
                    size="sm"
                    icon={Calendar}
                    onClick={() => setActiveTab('calendar')}
                  >
                    Agenda Semanal
                  </GlassmorphismButton>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {(selectedField ? fields.filter(f => f.id === selectedField) : fields).map((field: any, index) => {
                  const stats = calculateFieldStats(field.id);
                  return (
                    <div key={field.id} className={`p-6 rounded-2xl border border-border hover-lift transition-all ${
                      index === 0 ? 'slide-up' : ''
                    }`}>
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-foreground text-lg">{field.name}</h3>
                          <p className="text-sm text-muted-foreground">{field.location}</p>
                        </div>
                        <GlassmorphismButton
                          variant="default"
                          size="sm"
                          onClick={() => {
                            setSelectedField(field.id);
                            setActiveTab('calendar');
                          }}
                        >
                          Ver Agenda
                        </GlassmorphismButton>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Reservas hoy</p>
                          <p className="text-xl font-bold text-foreground">{stats.todayReservations}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Ingresos</p>
                          <p className="text-xl font-bold text-green-dynamic">
                            {formatCurrency(stats.revenue)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Horarios libres</p>
                          <p className="text-xl font-bold text-electric-blue">{stats.freeSlots}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Advertising Management Section */}
            <div className="space-y-4">
              <AdBanner 
                location="dashboard" 
                className="rounded-2xl"
              />
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
                <div className="text-center py-8 px-6">
                  <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No hay reservas para hoy
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    Las reservas aparecerán aquí cuando los jugadores las realicen
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddFieldModal
        isOpen={showAddField}
        onClose={() => setShowAddField(false)}
        onFieldAdded={handleFieldAdded}
        userId={user?.id}
      />
      
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentUpdated={handlePaymentUpdated}
        payment={selectedPayment}
        isAdmin={true}
      />

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
