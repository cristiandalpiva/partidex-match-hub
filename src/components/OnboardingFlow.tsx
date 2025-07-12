import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Trophy, Users, MapPin, Calendar, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFlowProps {
  isOpen: boolean;
  onComplete: () => void;
  userProfile: any;
}

interface OnboardingData {
  preferredPositions: string[];
  playingDays: string[];
  experience: string;
  location: string;
  goals: string[];
}

const POSITIONS = [
  'Portero', 'Defensa', 'Mediocampo', 'Delantero', 'Lateral', 'Volante'
];

const DAYS = [
  'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
];

const EXPERIENCE_LEVELS = [
  { value: 'beginner', label: 'Principiante', desc: 'Nuevo en el fútbol' },
  { value: 'intermediate', label: 'Intermedio', desc: 'Juego ocasionalmente' },
  { value: 'advanced', label: 'Avanzado', desc: 'Juego regularmente' },
  { value: 'professional', label: 'Profesional', desc: 'Nivel competitivo' }
];

const GOALS = [
  'Hacer ejercicio', 'Conocer gente', 'Competir', 'Mejorar técnica', 
  'Diversión', 'Formar equipo'
];

export const OnboardingFlow = ({ isOpen, onComplete, userProfile }: OnboardingFlowProps) => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    preferredPositions: [],
    playingDays: [],
    experience: '',
    location: '',
    goals: []
  });

  const totalSteps = userProfile?.role === 'player' ? 5 : 3;

  const handleArrayToggle = (field: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: (prev[field] as string[]).includes(value)
        ? (prev[field] as string[]).filter(item => item !== value)
        : [...(prev[field] as string[]), value]
    }));
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setOnboardingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      // Save onboarding data to user profile
      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_data: JSON.stringify(onboardingData)
        })
        .eq('user_id', userProfile.user_id);

      if (error) throw error;

      toast({
        title: "¡Bienvenido a Partidex!",
        description: "Tu perfil ha sido configurado exitosamente.",
      });

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast({
        title: "Error",
        description: "No se pudo completar la configuración inicial.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPlayerStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="w-16 h-16 text-gold-premium mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¡Bienvenido a Partidex!
              </h2>
              <p className="text-muted-foreground">
                Vamos a configurar tu perfil para encontrar los mejores partidos para ti.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¿En qué posiciones juegas?
              </h2>
              <p className="text-muted-foreground">
                Selecciona todas las posiciones en las que te sientes cómodo.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {POSITIONS.map((position) => (
                <Card 
                  key={position}
                  className={`cursor-pointer transition-all hover-lift ${
                    onboardingData.preferredPositions.includes(position)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleArrayToggle('preferredPositions', position)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-foreground">{position}</p>
                    {onboardingData.preferredPositions.includes(position) && (
                      <Check className="w-4 h-4 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¿Qué días prefieres jugar?
              </h2>
              <p className="text-muted-foreground">
                Selecciona los días que tienes disponibles.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {DAYS.map((day) => (
                <Card 
                  key={day}
                  className={`cursor-pointer transition-all hover-lift ${
                    onboardingData.playingDays.includes(day)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleArrayToggle('playingDays', day)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-foreground">{day}</p>
                    {onboardingData.playingDays.includes(day) && (
                      <Check className="w-4 h-4 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¿Cuál es tu nivel de experiencia?
              </h2>
              <p className="text-muted-foreground">
                Esto nos ayuda a encontrar partidos de tu nivel.
              </p>
            </div>
            
            <div className="space-y-3">
              {EXPERIENCE_LEVELS.map((level) => (
                <Card 
                  key={level.value}
                  className={`cursor-pointer transition-all hover-lift ${
                    onboardingData.experience === level.value
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleInputChange('experience', level.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{level.label}</p>
                        <p className="text-sm text-muted-foreground">{level.desc}</p>
                      </div>
                      {onboardingData.experience === level.value && (
                        <Check className="w-5 h-5 text-primary" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">¿En qué zona prefieres jugar?</Label>
              <Input
                id="location"
                placeholder="Ej: Palermo, Belgrano, Microcentro..."
                value={onboardingData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¿Cuáles son tus objetivos?
              </h2>
              <p className="text-muted-foreground">
                Selecciona lo que buscas en Partidex.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {GOALS.map((goal) => (
                <Card 
                  key={goal}
                  className={`cursor-pointer transition-all hover-lift ${
                    onboardingData.goals.includes(goal)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleArrayToggle('goals', goal)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-foreground">{goal}</p>
                    {onboardingData.goals.includes(goal) && (
                      <Check className="w-4 h-4 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const renderAdminStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gold-premium mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">
                ¡Bienvenido, Administrador!
              </h2>
              <p className="text-muted-foreground">
                Configura tu perfil para gestionar tu cancha de la mejor manera.
              </p>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                Información de tu cancha
              </h2>
              <p className="text-muted-foreground">
                Ayúdanos a conocer más sobre tu establecimiento.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación de la cancha</Label>
                <Input
                  id="location"
                  placeholder="Ej: Av. Corrientes 1234, CABA"
                  value={onboardingData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Users className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                ¿Qué objetivos tienes?
              </h2>
              <p className="text-muted-foreground">
                Selecciona lo que buscas lograr con Partidex.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {['Aumentar reservas', 'Gestionar pagos', 'Organizar horarios', 'Análisis de rendimiento'].map((goal) => (
                <Card 
                  key={goal}
                  className={`cursor-pointer transition-all hover-lift ${
                    onboardingData.goals.includes(goal)
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => handleArrayToggle('goals', goal)}
                >
                  <CardContent className="p-4 text-center">
                    <p className="font-medium text-foreground">{goal}</p>
                    {onboardingData.goals.includes(goal) && (
                      <Check className="w-4 h-4 text-primary mx-auto mt-2" />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="glass max-w-2xl"  onInteractOutside={(e) => e.preventDefault()}>
        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Paso {currentStep} de {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-gold-premium h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="min-h-[400px]">
            {userProfile?.role === 'player' ? renderPlayerStep() : renderAdminStep()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </Button>

            {currentStep === totalSteps ? (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex items-center gap-2 bg-gradient-to-r from-primary to-gold-premium"
              >
                {loading ? 'Guardando...' : 'Completar'}
                <Check className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                className="flex items-center gap-2"
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};