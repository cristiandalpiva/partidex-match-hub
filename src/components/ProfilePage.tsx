import React, { useState, useEffect } from 'react';
import { User, Trophy, Calendar, CreditCard, TrendingUp, ArrowLeft, Edit2, MapPin, Settings, Shield, Bell } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { ScoreRing } from '@/components/ui/score-ring';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    avatar_url: '',
    bio: '',
    location: '',
    preferred_position: '',
    phone: '',
    emergency_contact: ''
  });
  
  const [stats, setStats] = useState({
    totalMatches: 0,
    attendedMatches: 0,
    totalPayments: 0,
    paidPayments: 0,
    attendanceRate: 0,
    paymentRate: 0,
    pendingPayments: 0,
    totalOwed: 0
  });

  const [matchHistory, setMatchHistory] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([
    { id: 1, type: 'MercadoPago', status: 'active', details: '****4567' },
    { id: 2, type: 'Tarjeta Débito', status: 'active', details: '****8901' }
  ]);

  useEffect(() => {
    loadProfileData();
  }, [userId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name || '',
          avatar_url: profileData.avatar_url || '',
          bio: profileData.bio || '',
          location: profileData.location || '',
          preferred_position: profileData.preferred_position || '',
          phone: profileData.phone || '',
          emergency_contact: profileData.emergency_contact || ''
        });
      }

      // Load score
      const { data: scoreData } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (scoreData) setScore(scoreData);

      // Load match history
      const { data: matchData } = await supabase
        .from('matches')
        .select(`
          *,
          teams(name),
          fields(name, location),
          attendance!inner(status, attended)
        `)
        .eq('attendance.user_id', userId)
        .order('date_time', { ascending: false })
        .limit(10);

      if (matchData) {
        setMatchHistory(matchData);
        
        // Calculate stats
        const totalMatches = matchData.length;
        const attendedMatches = matchData.filter(m => m.attendance?.[0]?.attended === true).length;
        const attendanceRate = totalMatches > 0 ? (attendedMatches / totalMatches) * 100 : 0;

        setStats(prev => ({
          ...prev,
          totalMatches,
          attendedMatches,
          attendanceRate
        }));
      }

      // Load payment stats
      const { data: paymentData } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId);

      if (paymentData) {
        const totalPayments = paymentData.length;
        const paidPayments = paymentData.filter(p => p.status === 'paid').length;
        const pendingPayments = paymentData.filter(p => p.status === 'pending').length;
        const totalOwed = paymentData
          .filter(p => p.status === 'pending')
          .reduce((sum, p) => sum + (p.amount || 0), 0);
        const paymentRate = totalPayments > 0 ? (paidPayments / totalPayments) * 100 : 0;

        setStats(prev => ({
          ...prev,
          totalPayments,
          paidPayments,
          paymentRate,
          pendingPayments,
          totalOwed
        }));
      }

    } catch (error) {
      console.error('Error loading profile data:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los datos del perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          avatar_url: formData.avatar_url,
          bio: formData.bio,
          location: formData.location,
          preferred_position: formData.preferred_position,
          phone: formData.phone,
          emergency_contact: formData.emergency_contact,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado exitosamente.",
      });

      setEditMode(false);
      loadProfileData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-dynamic"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/5 via-background to-gold-premium/5">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <GlassmorphismButton
                variant="default"
                size="sm"
                icon={ArrowLeft}
                onClick={onBack}
              >
                Volver
              </GlassmorphismButton>
              <h1 className="text-xl font-bold text-foreground">Mi Perfil</h1>
            </div>
            
            <GlassmorphismButton
              variant={editMode ? "green" : "default"}
              size="sm"
              icon={editMode ? Trophy : Edit2}
              onClick={editMode ? handleSaveProfile : () => setEditMode(true)}
            >
              {editMode ? 'Guardar' : 'Editar'}
            </GlassmorphismButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="glass rounded-3xl p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback className="bg-gradient-to-br from-gold-premium to-gold-premium-light text-black-deep text-xl font-bold">
                    {formData.name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="space-y-2">
                  {editMode ? (
                    <div className="space-y-2">
                      <Input
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nombre completo"
                        className="text-lg font-bold"
                      />
                      <Input
                        value={formData.avatar_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                        placeholder="URL de la foto de perfil"
                        className="text-sm"
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl font-bold text-foreground">{profile?.name || 'Usuario'}</h2>
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="bg-green-dynamic/20 text-green-dynamic">
                          {profile?.role === 'player' ? 'Jugador' : profile?.role}
                        </Badge>
                        {formData.location && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {formData.location}
                          </Badge>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Responsibility Score */}
              {score && score.total_games > 0 && (
                <div className="ml-auto">
                  <ScoreRing score={score.score} size="lg" />
                  <p className="text-center text-sm text-muted-foreground mt-2">Score de Responsabilidad</p>
                </div>
              )}
            </div>

            {/* Bio Section */}
            <div className="mt-6">
              {editMode ? (
                <div className="space-y-2">
                  <Label htmlFor="bio">Descripción</Label>
                  <Textarea
                    id="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="Cuéntanos sobre ti, tus habilidades y experiencia en el deporte..."
                    className="min-h-[80px]"
                  />
                </div>
              ) : formData.bio ? (
                <p className="text-muted-foreground">{formData.bio}</p>
              ) : (
                <p className="text-muted-foreground italic">No hay descripción disponible</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <p className="text-2xl font-bold text-green-dynamic">{stats.totalMatches}</p>
                <p className="text-sm text-muted-foreground">Partidos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <p className="text-2xl font-bold text-gold-premium">{Math.round(stats.attendanceRate)}%</p>
                <p className="text-sm text-muted-foreground">Asistencia</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <p className="text-2xl font-bold text-blue-500">{Math.round(stats.paymentRate)}%</p>
                <p className="text-sm text-muted-foreground">Pagos</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-muted/10">
                <p className={`text-2xl font-bold ${stats.totalOwed > 0 ? 'text-red-500' : 'text-green-dynamic'}`}>
                  ${stats.totalOwed.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Adeudado</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Información Personal
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                {editMode ? (
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ciudad, País"
                  />
                ) : (
                  <p className="text-foreground">{formData.location || 'No especificada'}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Posición Preferida</Label>
                {editMode ? (
                  <Select value={formData.preferred_position} onValueChange={(value) => setFormData(prev => ({ ...prev, preferred_position: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu posición" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="portero">Portero</SelectItem>
                      <SelectItem value="defensa">Defensa</SelectItem>
                      <SelectItem value="mediocampo">Mediocampo</SelectItem>
                      <SelectItem value="delantero">Delantero</SelectItem>
                      <SelectItem value="volante">Volante</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-foreground">{formData.preferred_position || 'No especificada'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                {editMode ? (
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+54 11 1234-5678"
                  />
                ) : (
                  <p className="text-foreground">{formData.phone || 'No especificado'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency">Contacto de Emergencia</Label>
                {editMode ? (
                  <Input
                    id="emergency"
                    value={formData.emergency_contact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergency_contact: e.target.value }))}
                    placeholder="Nombre y teléfono"
                  />
                ) : (
                  <p className="text-foreground">{formData.emergency_contact || 'No especificado'}</p>
                )}
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Métodos de Pago
            </h3>
            
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{method.type}</p>
                      <p className="text-sm text-muted-foreground">{method.details}</p>
                    </div>
                  </div>
                  <Badge variant={method.status === 'active' ? 'default' : 'secondary'}>
                    {method.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              ))}
            </div>
            
            <GlassmorphismButton variant="default" size="sm" className="mt-4">
              Gestionar Métodos de Pago
            </GlassmorphismButton>
          </div>

          {/* Match History */}
          <div className="glass rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Historial de Partidos
            </h3>
            
            {matchHistory.length > 0 ? (
              <div className="space-y-3">
                {matchHistory.slice(0, 5).map((match: any) => (
                  <div key={match.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div>
                      <p className="font-medium text-foreground">{match.teams?.name || 'Equipo'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(match.date_time).toLocaleDateString()} - {match.fields?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={match.attendance?.[0]?.attended ? 'default' : 'destructive'}>
                        {match.attendance?.[0]?.attended ? 'Asistió' : 'No asistió'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay historial de partidos</p>
            )}
          </div>

          {/* Financial Alerts */}
          {stats.totalOwed > 0 && (
            <div className="glass rounded-3xl p-6 border-l-4 border-red-500">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-red-500" />
                Alerta Financiera
              </h3>
              
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <p className="text-red-700 dark:text-red-300 font-medium">
                  Tienes pagos pendientes por un total de ${stats.totalOwed.toLocaleString()}
                </p>
                <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                  {stats.pendingPayments} pago{stats.pendingPayments !== 1 ? 's' : ''} pendiente{stats.pendingPayments !== 1 ? 's' : ''}
                </p>
                
                <GlassmorphismButton variant="destructive" size="sm" className="mt-3">
                  Realizar Pago
                </GlassmorphismButton>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};