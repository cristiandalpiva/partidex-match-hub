import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Calendar, 
  CreditCard, 
  Star, 
  CheckCircle,
  ArrowRight,
  Home
} from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Card, CardContent } from '@/components/ui/card';

const PlayerInfo = () => {
  const navigate = useNavigate();

  const playerFeatures = [
    {
      icon: Trophy,
      title: "Score de Responsabilidad",
      description: "Sistema único que mide tu compromiso y puntualidad en los partidos. Construye tu reputación como jugador confiable."
    },
    {
      icon: Users,
      title: "Gestión de Equipos",
      description: "Crea tu propio equipo, únete a otros existentes y administra jugadores. Coordina con tus compañeros fácilmente."
    },
    {
      icon: Calendar,
      title: "Calendario de Partidos",
      description: "Visualiza todos tus próximos encuentros, confirma asistencia y recibe recordatorios automáticos."
    },
    {
      icon: CreditCard,
      title: "Pagos Seguros",
      description: "Gestiona pagos de cancha y cuotas de equipo de forma segura con múltiples métodos de pago."
    },
    {
      icon: Star,
      title: "Perfil Personalizado",
      description: "Mantén tu información actualizada, historial de partidos y estadísticas personales."
    },
    {
      icon: CheckCircle,
      title: "Confirmaciones Rápidas",
      description: "Confirma tu asistencia a partidos con un solo click y mantén informado a tu equipo."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/10 via-background to-gold-premium/5">
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
                <p className="text-sm text-muted-foreground">Dashboard Jugador</p>
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
              <span className="text-gradient-gold"> Jugador</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Todo lo que necesitas para gestionar tu experiencia futbolística en una sola plataforma. 
              Organiza partidos, maneja equipos y mantén tu score de responsabilidad al máximo.
            </p>
          </div>

          {/* Placeholder para captura de pantalla */}
          <div className="flex justify-center py-6">
            <div className="w-full max-w-4xl h-[400px] bg-gradient-to-br from-green-dynamic/20 to-gold-premium/20 rounded-2xl shadow-xl flex items-center justify-center border border-white/20 glass">
              <div className="text-center">
                <Trophy className="w-16 h-16 text-gold-premium mx-auto mb-4" />
                <p className="text-muted-foreground">Captura del Dashboard del Jugador</p>
                <p className="text-sm text-muted-foreground mt-2">Se agregará la imagen proporcionada</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Funcionalidades Principales</h3>
          <p className="text-lg text-muted-foreground">Herramientas diseñadas para mejorar tu experiencia como jugador</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playerFeatures.map((feature, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-dynamic to-green-dynamic-dark flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-white" />
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
              ¿Listo para empezar como jugador?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Únete a Partidex y disfruta de la mejor experiencia futbolística. 
              Gestiona tus partidos, equipos y construye tu reputación como jugador responsable.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <GlassmorphismButton
                variant="gold"
                size="lg"
                icon={ArrowRight}
                onClick={() => navigate('/login')}
              >
                Crear Cuenta de Jugador
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

export default PlayerInfo;