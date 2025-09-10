import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  MapPin, 
  TrendingUp, 
  Clock, 
  Shield,
  Calendar,
  Users,
  CreditCard,
  Settings,
  ArrowRight,
  Home
} from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Card, CardContent } from '@/components/ui/card';

const AdminInfo = () => {
  const navigate = useNavigate();

  const adminFeatures = [
    {
      icon: MapPin,
      title: "Gestión de Canchas",
      description: "Administra múltiples canchas con información detallada, ubicación, características y disponibilidad."
    },
    {
      icon: TrendingUp,
      title: "Métricas en Tiempo Real",
      description: "Visualiza ingresos, reservas, estadísticas de rendimiento y analytics completos de tu negocio."
    },
    {
      icon: Clock,
      title: "Horarios Optimizados",
      description: "Control completo de disponibilidad, gestión de reservas y optimización de horarios por cancha."
    },
    {
      icon: Shield,
      title: "Pagos Centralizados",
      description: "Configuración y gestión de métodos de pago integrados con MercadoPago y otros proveedores."
    },
    {
      icon: Calendar,
      title: "Calendario de Reservas",
      description: "Vista completa de todas las reservas, partidos programados y eventos en tus canchas."
    },
    {
      icon: Users,
      title: "Gestión de Clientes",
      description: "Administra equipos, jugadores y mantén un registro detallado de tus clientes habituales."
    },
    {
      icon: CreditCard,
      title: "Control Financiero",
      description: "Seguimiento de ingresos, gastos, reportes financieros y gestión de cobros automatizada."
    },
    {
      icon: Settings,
      title: "Configuración Avanzada",
      description: "Personaliza precios, políticas de cancelación, descuentos y reglas de negocio específicas."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gold-premium/10 via-background to-green-dynamic/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                alt="Partidex Logo" 
                className="w-12 h-12 rounded-xl"
              />
              <div>
                <h1 className="text-2xl font-bold text-gradient-gold">Partidex</h1>
                <p className="text-sm text-muted-foreground">Dashboard Administrador</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={Home}
                onClick={() => navigate('/')}
              >
                Inicio
              </GlassmorphismButton>
              <GlassmorphismButton
                variant="gold"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="space-y-8 fade-in">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Dashboard 
              <span className="text-gradient-gold"> Administrador</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Herramientas profesionales para gestionar tus canchas de fútbol. 
              Controla reservas, optimiza ingresos y ofrece la mejor experiencia a tus clientes.
            </p>
          </div>

          {/* Placeholder para captura de pantalla */}
          <div className="flex justify-center py-6">
            <div className="w-full max-w-4xl h-[400px] bg-gradient-to-br from-gold-premium/20 to-green-dynamic/20 rounded-2xl shadow-xl flex items-center justify-center border border-white/20 glass">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gold-premium mx-auto mb-4" />
                <p className="text-muted-foreground">Captura del Dashboard del Administrador</p>
                <p className="text-sm text-muted-foreground mt-2">Se agregará la imagen proporcionada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Funcionalidades de Gestión</h3>
          <p className="text-lg text-muted-foreground">Herramientas profesionales para administrar tu negocio de canchas</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-premium to-gold-premium-light flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-black-deep" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="glass rounded-3xl border-white/20">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para gestionar tus canchas profesionalmente?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a Partidex como administrador y lleva tu negocio de canchas al siguiente nivel. 
              Optimiza reservas, incrementa ingresos y ofrece la mejor experiencia a tus clientes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassmorphismButton
                variant="gold"
                size="lg"
                icon={ArrowRight}
                onClick={() => navigate('/login')}
              >
                Crear Cuenta de Administrador
              </GlassmorphismButton>
              <GlassmorphismButton
                variant="default"
                size="lg"
                onClick={() => navigate('/')}
              >
                Volver al Inicio
              </GlassmorphismButton>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default AdminInfo;