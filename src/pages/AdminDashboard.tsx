
import React from 'react';
import { Calendar, MapPin, DollarSign, Users, TrendingUp, Clock } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { EmptyState } from '@/components/ui/empty-state';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  
  // Mock data
  const adminData = {
    name: 'María González',
    fields: [
      {
        id: 1,
        name: 'Cancha Central',
        location: 'Zona Norte',
        occupancy: 85,
        todayReservations: 6,
        revenue: 450000
      },
      {
        id: 2,
        name: 'La Bombonera',
        location: 'Centro',
        occupancy: 92,
        todayReservations: 8,
        revenue: 680000
      }
    ],
    todayStats: {
      totalRevenue: 1130000,
      totalReservations: 14,
      avgOccupancy: 88.5,
      newBookings: 3
    },
    weeklyStats: {
      revenue: [120, 150, 180, 200, 160, 220, 280],
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    },
    upcomingReservations: [
      {
        id: 1,
        teamName: 'Los Tigres',
        field: 'Cancha Central',
        time: '19:00',
        duration: '2h',
        paid: true,
        responsible: 'Carlos Martínez'
      },
      {
        id: 2,
        teamName: 'Amigos FC',
        field: 'La Bombonera',
        time: '20:30',
        duration: '1.5h',
        paid: false,
        responsible: 'Juan Pérez'
      }
    ]
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
                <p className="text-sm text-muted-foreground">¡Hola, {adminData.name}!</p>
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
                  {formatCurrency(adminData.todayStats.totalRevenue)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">+15% vs ayer</p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Reservas</h3>
                  <Calendar className="w-5 h-5 text-gold-premium" />
                </div>
                <p className="text-2xl font-bold text-gold-premium">
                  {adminData.todayStats.totalReservations}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  +{adminData.todayStats.newBookings} nuevas
                </p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Ocupación</h3>
                  <TrendingUp className="w-5 h-5 text-electric-blue" />
                </div>
                <p className="text-2xl font-bold text-electric-blue">
                  {adminData.todayStats.avgOccupancy}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">Promedio general</p>
              </div>

              <div className="glass rounded-3xl p-6 hover-lift">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-muted-foreground">Canchas Activas</h3>
                  <MapPin className="w-5 h-5 text-vibrant-orange" />
                </div>
                <p className="text-2xl font-bold text-vibrant-orange">
                  {adminData.fields.length}
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
                {adminData.fields.map((field, index) => (
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

              {adminData.upcomingReservations.length > 0 ? (
                <div className="space-y-4">
                  {adminData.upcomingReservations.map((reservation, index) => (
                    <div key={reservation.id} className={`p-4 rounded-2xl border transition-all hover-lift ${
                      reservation.paid 
                        ? 'border-green-dynamic/30 bg-green-dynamic/5' 
                        : 'border-intense-red/30 bg-intense-red/5'
                    } ${index === 0 ? 'slide-up' : ''}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            reservation.paid ? 'bg-green-dynamic' : 'bg-intense-red animate-pulse'
                          }`} />
                          <div>
                            <h3 className="font-semibold text-foreground">{reservation.teamName}</h3>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{reservation.time} • {reservation.duration}</span>
                              <span>{reservation.field}</span>
                              <span>Responsable: {reservation.responsible}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {!reservation.paid && (
                            <GlassmorphismButton variant="green" size="sm">
                              Marcar Pagado
                            </GlassmorphismButton>
                          )}
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
