import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Trophy, 
  Users, 
  Target, 
  Heart, 
  Shield, 
  Star,
  ArrowLeft
} from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Card, CardContent } from '@/components/ui/card';

const About = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Heart,
      title: "Pasión por el Fútbol",
      description: "Creemos que el fútbol es más que un deporte, es una forma de vida que une a las personas."
    },
    {
      icon: Users,
      title: "Comunidad",
      description: "Fomentamos una comunidad inclusiva donde todos los jugadores pueden encontrar su lugar."
    },
    {
      icon: Shield,
      title: "Confianza",
      description: "Construimos relaciones basadas en la transparencia y la confiabilidad en cada interacción."
    },
    {
      icon: Target,
      title: "Excelencia",
      description: "Nos esforzamos por ofrecer la mejor experiencia posible en cada aspecto de nuestra plataforma."
    }
  ];

  const team = [
    {
      name: "Equipo de Desarrollo",
      role: "Tecnología",
      description: "Desarrolladores apasionados que entienden las necesidades de la comunidad futbolística."
    },
    {
      name: "Equipo de Producto",
      role: "Experiencia de Usuario",
      description: "Diseñadores y especialistas en UX que crean experiencias intuitivas y atractivas."
    },
    {
      name: "Equipo de Soporte",
      role: "Atención al Cliente",
      description: "Especialistas dedicados a ayudar a nuestra comunidad 24/7."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/10 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={ArrowLeft}
                onClick={() => navigate('/')}
              >
                Volver
              </GlassmorphismButton>
              <div className="flex items-center gap-3">
                <img 
                  src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                  alt="Partidex Logo" 
                  className="w-12 h-12 rounded-xl"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gradient-gold">Partidex</h1>
                  <p className="text-sm text-muted-foreground">Tu mejor fichaje</p>
                </div>
              </div>
            </div>
            
            <GlassmorphismButton
              variant="gold"
              size="md"
              onClick={() => navigate('/login')}
            >
              Ingresar
            </GlassmorphismButton>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="space-y-8 fade-in">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-6xl font-bold text-foreground">
              Acerca de 
              <span className="text-gradient-gold"> Partidex</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Somos una plataforma creada por y para la comunidad futbolística, con la misión de simplificar la organización de partidos y la gestión de canchas.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="glass rounded-3xl border-white/20">
          <CardContent className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-dynamic to-gold-premium flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-3xl font-bold text-foreground mb-4">Nuestra Misión</h3>
            <p className="text-lg text-muted-foreground max-w-4xl mx-auto">
              Revolucionar la forma en que se organizan los partidos de fútbol, creando una plataforma que conecte a jugadores, equipos y administradores de canchas en un ecosistema digital integral. Queremos que cada partido sea una experiencia memorable, desde la organización hasta el último silbato.
            </p>
          </CardContent>
        </Card>
      </section>

      {/* Values Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Nuestros Valores</h3>
          <p className="text-lg text-muted-foreground">Los principios que guían cada decisión en Partidex</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 hover-lift bounce-in" style={{animationDelay: `${index * 0.1}s`}}>
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-electric-blue to-vibrant-orange flex items-center justify-center">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-sm text-muted-foreground">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold text-foreground mb-4">Nuestro Equipo</h3>
          <p className="text-lg text-muted-foreground">Profesionales dedicados a hacer de Partidex la mejor plataforma</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <Card key={index} className="glass rounded-3xl border-white/20 slide-up" style={{animationDelay: `${index * 0.2}s`}}>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-green-dynamic to-green-dynamic-dark flex items-center justify-center">
                  <Star className="w-10 h-10 text-white" />
                </div>
                <h4 className="text-xl font-semibold text-foreground mb-2">{member.name}</h4>
                <p className="text-gold-premium font-medium mb-3">{member.role}</p>
                <p className="text-muted-foreground">{member.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="glass rounded-3xl border-white/20">
          <CardContent className="p-12">
            <div className="max-w-4xl mx-auto text-center">
              <h3 className="text-3xl font-bold text-foreground mb-6">Nuestra historia</h3>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>
                  Partidex nació de la frustración de organizar partidos de fútbol. Como jugadores, entendimos lo difícil que era coordinar horarios, encontrar canchas disponibles y gestionar los pagos de manera eficiente.
                </p>
                <p>
                  En 2025, decidimos crear la solución que nosotros hubiéramos querido tener: una plataforma integral que simplificara cada aspecto de la experiencia futbolística, desde la formación de equipos hasta la reserva de canchas.
                </p>
                <p>
                  Hoy, Partidex es utilizada por miles de jugadores y administradores que han encontrado en nuestra plataforma la herramienta perfecta para hacer del fútbol una experiencia más organizada, social y divertida.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <Card className="glass rounded-3xl border-white/20">
          <CardContent className="p-12 text-center">
            <h3 className="text-3xl font-bold text-foreground mb-4">
              ¿Listo para unirte a Partidex?
            </h3>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Forma parte de la comunidad que está revolucionando el fútbol amateur.
            </p>
            <GlassmorphismButton
              variant="gold"
              size="lg"
              onClick={() => navigate('/login')}
            >
              Comenzar Ahora
            </GlassmorphismButton>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="glass border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img 
                src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
                alt="Partidex Logo" 
                className="w-8 h-8 rounded-lg"
              />
              <span className="text-lg font-bold text-gradient-gold">Partidex</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 Partidex. Todos los derechos reservados.
            </p>
            <GlassmorphismButton
              variant="default"
              size="sm"
              onClick={() => navigate('/')}
            >
              Inicio
            </GlassmorphismButton>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default About;