import React, { useState, useEffect } from 'react';
import { User, Trophy, Calendar, CreditCard, TrendingUp, ArrowLeft } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { ScoreRing } from '@/components/ui/score-ring';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfilePageProps {
  userId: string;
  onBack: () => void;
}

export const ProfilePage = ({ userId, onBack }: ProfilePageProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [score, setScore] = useState<any>(null);
  const [stats, setStats] = useState({
    totalMatches: 0,
    attendedMatches: 0,
    totalPayments: 0,
    paidPayments: 0,
    attendanceRate: 0,
    paymentRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) setProfile(profileData);

      // Load score
      const { data: scoreData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (scoreData) setScore(scoreData);

      // Load detailed stats
      const { data: attendanceData } = await supabase
        .from('attendance')
        .select('status, attended')
        .eq('user_id', userId);

      const { data: paymentsData } = await supabase
        .from('payments')
        .select('status')
        .eq('user_id', userId);

      if (attendanceData && paymentsData) {
        const totalMatches = attendanceData.length;
        const attendedMatches = attendanceData.filter(a => a.attended === true).length;
        const totalPayments = paymentsData.length;
        const paidPayments = paymentsData.filter(p => p.status === 'paid').length;

        setStats({
          totalMatches,
          attendedMatches,
          totalPayments,
          paidPayments,
          attendanceRate: totalMatches > 0 ? (attendedMatches / totalMatches) * 100 : 100,
          paymentRate: totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 100
        });
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: "Error",
        description: "No se pudo cargar la información del perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-yellow-500'; // Gold
    if (score >= 75) return 'text-green-500'; // Green
    if (score >= 50) return 'text-orange-500'; // Orange
    return 'text-red-500'; // Red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excelente';
    if (score >= 75) return 'Bueno';
    if (score >= 50) return 'Regular';
    return 'Necesita mejorar';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5 flex items-center justify-center">
        <div className="glass rounded-3xl p-8">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted/20 rounded w-32"></div>
            <div className="h-16 bg-muted/20 rounded"></div>
            <div className="h-4 bg-muted/20 rounded w-24"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <GlassmorphismButton
              variant="default"
              size="sm"
              icon={ArrowLeft}
              onClick={onBack}
            >
              Volver
            </GlassmorphismButton>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-black-deep" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
                <p className="text-sm text-muted-foreground">Score de Responsabilidad</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-8 fade-in">
          {/* Profile Overview */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center gap-6">
              <div className="flex-shrink-0">
                <ScoreRing score={score?.score || 100} size="lg" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">{profile?.name}</h2>
                <div className={`text-lg font-semibold ${getScoreColor(score?.score || 100)}`}>
                  {getScoreLabel(score?.score || 100)}
                </div>
                <p className="text-muted-foreground mt-2">
                  Tu score se calcula basado en tu asistencia a partidos y cumplimiento de pagos.
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Stats */}
            <div className="glass rounded-3xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Asistencia</h3>
                <Calendar className="w-6 h-6 text-green-dynamic" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Partidos jugados</span>
                  <span className="text-2xl font-bold text-green-dynamic">
                    {stats.attendedMatches}/{stats.totalMatches}
                  </span>
                </div>
                
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-green-dynamic to-neon-green transition-all duration-700"
                    style={{ width: `${stats.attendanceRate}%` }}
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-lg font-bold text-green-dynamic">
                    {stats.attendanceRate.toFixed(1)}%
                  </span>
                  <p className="text-xs text-muted-foreground">Tasa de asistencia</p>
                </div>
              </div>
            </div>

            {/* Payment Stats */}
            <div className="glass rounded-3xl p-6 hover-lift">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Pagos</h3>
                <CreditCard className="w-6 h-6 text-gold-premium" />
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Pagos realizados</span>
                  <span className="text-2xl font-bold text-gold-premium">
                    {stats.paidPayments}/{stats.totalPayments}
                  </span>
                </div>
                
                <div className="w-full bg-muted/20 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-gradient-to-r from-gold-premium to-gold-premium-light transition-all duration-700"
                    style={{ width: `${stats.paymentRate}%` }}
                  />
                </div>
                
                <div className="text-center">
                  <span className="text-lg font-bold text-gold-premium">
                    {stats.paymentRate.toFixed(1)}%
                  </span>
                  <p className="text-xs text-muted-foreground">Cumplimiento de pagos</p>
                </div>
              </div>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Desglose del Score</h3>
              <TrendingUp className="w-6 h-6 text-gold-premium" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-2xl border border-border">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gold-premium" />
                <div className="text-2xl font-bold text-foreground">{score?.score || 100}</div>
                <div className="text-sm text-muted-foreground">Score Total</div>
              </div>

              <div className="text-center p-4 rounded-2xl border border-border">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-green-dynamic" />
                <div className="text-2xl font-bold text-foreground">{score?.attended || 0}</div>
                <div className="text-sm text-muted-foreground">Partidos asistidos</div>
              </div>

              <div className="text-center p-4 rounded-2xl border border-border">
                <CreditCard className="w-8 h-8 mx-auto mb-2 text-electric-blue" />
                <div className="text-2xl font-bold text-foreground">{score?.paid || 0}</div>
                <div className="text-sm text-muted-foreground">Pagos realizados</div>
              </div>
            </div>

            <div className="mt-6 p-4 rounded-lg bg-muted/10 border border-border">
              <h4 className="font-medium text-foreground mb-2">¿Cómo mejorar tu score?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Asiste a todos los partidos que confirmes</li>
                <li>• Paga puntualmente tus cuotas</li>
                <li>• Avisa con tiempo si no puedes asistir</li>
                <li>• Mantén una comunicación activa con tu equipo</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};