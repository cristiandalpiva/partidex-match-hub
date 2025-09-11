import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  MapPin, 
  CreditCard, 
  TrendingUp, 
  Star, 
  Shield, 
  Clock, 
  PlayCircle,
  CheckCircle,
  ArrowRight
} from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Card, CardContent } from '@/components/ui/card';

const LandingPage = () => {
  const navigate = useNavigate();

  const playerFeatures = [
    {
      icon: Trophy,
      title: "Score de Responsabilidad",
      description: "Sistema único que mide tu compromiso y puntualidad en los partidos"
    },
    {
      icon: Users,
      title: "Gestión de Equipos",
      description: "Crea, únete y administra tus equipos de fútbol fácilmente"
    },
    {
      icon: Calendar,
      title: "Calendario de Partidos",
      description: "Visualiza y confirma tu asistencia a próximos encuentros"
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Gestiona pagos de cancha y cuotas de equipo de forma segura"
    }
  ];

  const adminFeatures = [
    {
      icon: MapPin,
      title: "Gestión de Canchas",
      description: "Administra múltiples canchas con información detallada"
    },
    {
      icon: TrendingUp,
      title: "Métricas en Tiempo Real",
      description: "Visualiza ingresos, reservas y estadísticas de rendimiento"
    },
    {
      icon: Clock,
      title: "Horarios Optimizados",
      description: "Control completo de disponibilidad y reservas por horarios"
    },
    {
      icon: Shield,
      title: "Pagos Centralizados",
      description: "Configuración y gestión de métodos de pago integrados"
    }
  ];

  const benefits = [
    {
      icon: Star,
      title: "Pasos sencillos",
      description: "Interfaz sencilla., En pocos pasos gestiona tus partidos."
    },
    {
      icon: CheckCircle,
      title: "Todo en Uno",
      description: "Desde la organización hasta el pago, todo integrado en una plataforma"
    },
    {
      icon: Users,
      title: "Comunidad Activa",
      description: "Conecta con jugadores y administradores en tu zona"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/10 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center">
                <img 
                  src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                  alt="Partidex Logo" 
                  className="w-12 h-12 rounded-xl"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient-gold">Partidex</h1>
                <p className="text-sm text-muted-foreground">Tu mejor fichaje</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="hidden md:flex items-center text-sm font-bold text-gradient-gold bg-gold-premium/10 px-4 py-2 rounded-full border border-gold-premium/20 h-9">
                Promociona tu cancha
              </span>
              <GlassmorphismButton
                variant="default"
                size="sm"
                onClick={() => navigate('/about')}
              >
                Acerca de
              </GlassmorphismButton>
              <GlassmorphismButton
                variant="default"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Iniciar Sesión
              </GlassmorphismButton>
              <GlassmorphismButton
                variant="gold"
                size="sm"
                onClick={() => navigate('/login')}
              >
                Registrarse
              </GlassmorphismButton>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="space-y-8 fade-in">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-bold text-foreground">
              La plataforma definitiva para el 
              <span className="text-gradient-gold"> fútbol</span>
            </h2>
            <p className="text-2xl text-muted-foreground max-w-3xl mx-auto">
              Organiza partidos, gestiona equipos, administra canchas y conecta con la comunidad futbolística. Todo en una sola plataforma.
            </p>
            
            {/* Hero Image */}
            <div className="flex justify-center py-6">
              <img 
                src="/lovable-uploads/d7b8b0a1-09a1-4906-9109-2926f449841c.png" 
                alt="Jugadores celebrando en el campo" 
                className="w-full max-w-2xl h-[364px] object-cover object-center rounded-2xl shadow-lg hover-scale"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GlassmorphismButton
              variant="gold"
              size="lg"
              icon={PlayCircle}
              onClick={() => navigate('/login')}
            >
              Comenzar Ahora
            </GlassmorphismButton>
            <GlassmorphismButton
              variant="default"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Conocer Más
            </GlassmorphismButton>
          </div>
        </div>
      </section>

      {/* Player Features */}
      <section id="features" className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-foreground mb-4">Para Jugadores</h3>
          <p className="text-xl text-muted-foreground">Herramientas diseñadas para mejorar tu experiencia futbolística</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {playerFeatures.map((feature, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-dynamic to-green-dynamic-dark flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-base text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Admin Features */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-foreground mb-4">Para Administradores</h3>
          <p className="text-xl text-muted-foreground">Gestiona tus canchas con herramientas profesionales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-premium to-gold-premium-light flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-black-deep" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h4>
                <p className="text-base text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h3 className="text-4xl font-bold text-foreground mb-4">¿Por qué Partidex?</h3>
          <p className="text-xl text-muted-foreground">La mejor experiencia para la comunidad futbolística</p>
        </div>

        {/* Team Photo */}
        <div className="flex justify-center py-6">
          <img 
            src="/lovable-uploads/f721baff-e533-454b-b153-4da10922e4d6.png" 
            alt="Equipo de fútbol celebrando juntos en el campo" 
            className="w-full max-w-4xl h-[400px] object-cover object-center rounded-2xl shadow-xl hover-scale"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div key={index} className="text-center slide-up" style={{animationDelay: `${index * 0.2}s`}}>
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-gold-premium to-gold-premium-light flex items-center justify-center shadow-lg">
                <benefit.icon className="w-10 h-10 text-black-deep" />
              </div>
              <h4 className="text-2xl font-semibold text-foreground mb-3">{benefit.title}</h4>
              <p className="text-lg text-muted-foreground">{benefit.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <Card className="glass rounded-3xl border-white/20">
          <CardContent className="p-10 text-center">
            <h3 className="text-4xl font-bold text-foreground mb-4">
              ¿Listo para revolucionar tu fútbol?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a la comunidad de jugadores y administradores que ya están disfrutando de la mejor experiencia futbolística.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassmorphismButton
                variant="gold"
                size="lg"
                icon={Users}
                onClick={() => navigate('/login')}
              >
                Soy Jugador
              </GlassmorphismButton>
              <GlassmorphismButton
                variant="green"
                size="lg"
                icon={MapPin}
                onClick={() => navigate('/login')}
              >
                Administro Canchas
              </GlassmorphismButton>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-12">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                  alt="Partidex Logo" 
                  className="w-8 h-8 rounded-lg"
                />
                <span className="text-lg font-bold text-gradient-gold">Partidex</span>
              </div>
              <p className="text-sm text-muted-foreground">
                La plataforma definitiva para el fútbol amateur.
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Plataforma</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/about')}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Acerca de
                </button>
                <button 
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Características
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Para Usuarios</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/player-info')}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard Jugador
                </button>
                <button 
                  onClick={() => navigate('/admin-info')}
                  className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dashboard Admin
                </button>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-foreground">Contacto</h4>
              <div className="space-y-2">
                <span className="block text-sm text-muted-foreground">
                  info@partidex.com
                </span>
                <span className="block text-sm text-muted-foreground">
                  +54 11 1234-5678
                </span>
              </div>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-muted-foreground mb-4 md:mb-0">
                © 2025 Partidex. Todos los derechos reservados.
              </p>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate('/about')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Términos de Servicio
                </button>
                <button 
                  onClick={() => navigate('/about')}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Política de Privacidad
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;