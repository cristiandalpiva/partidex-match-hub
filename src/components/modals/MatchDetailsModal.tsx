import React, { useState, useEffect } from 'react';
import { X, Users, MapPin, Calendar, DollarSign, CheckCircle, XCircle, Clock, Share2 } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { ShareMatchModal } from './ShareMatchModal';
import { useToast } from '@/hooks/use-toast';

interface MatchDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export const MatchDetailsModal = ({ isOpen, onClose, match }: MatchDetailsModalProps) => {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userAttendance, setUserAttendance] = useState<any>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && match) {
      loadMatchDetails();
      getCurrentUser();
    }
  }, [isOpen, match]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
    
    if (user && match?.id) {
      const { data } = await supabase
        .from('attendance')
        .select('*')
        .eq('match_id', match.id)
        .eq('user_id', user.id)
        .single();
      
      setUserAttendance(data);
    }
  };

  const loadMatchDetails = async () => {
    if (!match?.id) return;
    
    try {
      const { data } = await supabase
        .from('attendance')
        .select(`
          *,
          profiles(name, avatar_url),
          payments(status, amount, paid_at)
        `)
        .eq('match_id', match.id);
      
      if (data) setPlayers(data);
    } catch (error) {
      console.error('Error loading match details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      confirmed: { label: 'Confirmado', variant: 'default' as const, color: 'text-green-600' },
      maybe: { label: 'Tal vez', variant: 'secondary' as const, color: 'text-yellow-600' },
      declined: { label: 'No va', variant: 'destructive' as const, color: 'text-red-600' }
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.maybe;
  };

  const getPaymentStatus = (payment: any) => {
    if (!payment) return { icon: XCircle, text: 'Sin pago', color: 'text-gray-500' };
    if (payment.status === 'paid') return { icon: CheckCircle, text: 'Pagado', color: 'text-green-600' };
    return { icon: Clock, text: 'Pendiente', color: 'text-yellow-600' };
  };

  const updateAttendance = async (status: string) => {
    if (!currentUser || !match?.id) return;
    
    try {
      const { error } = await supabase
        .from('attendance')
        .upsert({
          match_id: match.id,
          user_id: currentUser.id,
          status: status
        });
      
      if (error) throw error;
      
      setUserAttendance({ ...userAttendance, status });
      loadMatchDetails(); // Refresh the players list
      
      toast({
        title: "¡Actualizado!",
        description: `Tu estado de asistencia se actualizó a: ${getStatusBadge(status).label}`
      });
    } catch (error) {
      console.error('Error updating attendance:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar tu asistencia",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Detalles del Partido</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Información del Partido</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span>Equipo: {match.teams?.name || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span>Cancha: {match.fields?.name || 'N/A'} - {match.fields?.location || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{formatDate(match.date_time)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className={`w-4 h-4 ${match.status === 'confirmed' ? 'text-green-600' : 'text-yellow-600'}`} />
                <span>Estado: {match.status === 'confirmed' ? 'Confirmado' : 'Pendiente'}</span>
              </div>
            </div>
          </div>

          {/* Players List */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Jugadores ({players.length})</h3>
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-dynamic mx-auto"></div>
              </div>
            ) : players.length > 0 ? (
              <div className="space-y-3">
                {players.map((player, index) => {
                  const statusBadge = getStatusBadge(player.status);
                  const paymentStatus = getPaymentStatus(player.payments);
                  const PaymentIcon = paymentStatus.icon;
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-black-deep">
                            {player.profiles?.name?.charAt(0) || 'J'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{player.profiles?.name || 'Jugador'}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <PaymentIcon className={`w-4 h-4 ${paymentStatus.color}`} />
                        <span className={`text-sm ${paymentStatus.color}`}>{paymentStatus.text}</span>
                        {player.payments && (
                          <span className="text-sm font-medium text-foreground">
                            ${player.payments.amount || '0'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No hay jugadores registrados</p>
            )}
          </div>

          {/* User Attendance Section */}
          {currentUser && (
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Mi Asistencia</h3>
              <div className="grid grid-cols-3 gap-2 mb-4">
                 {[
                   { value: 'confirmed', label: 'Asistiré', emoji: '✅' },
                   { value: 'maybe', label: 'Quizás', emoji: '❓' },
                   { value: 'declined', label: 'No asistiré', emoji: '❌' }
                 ].map(option => (
                   <button
                     key={option.value}
                     onClick={() => updateAttendance(option.value)}
                     className={`p-3 rounded-lg border transition-all ${
                       userAttendance?.status === option.value
                         ? 'bg-green-dynamic text-black-deep border-green-dynamic font-medium'
                         : 'border-border hover:bg-muted/50 text-foreground'
                     }`}
                   >
                     <div className="text-lg mb-1">{option.emoji}</div>
                     <div className="text-xs text-black-deep">{option.label}</div>
                   </button>
                 ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <GlassmorphismButton
              variant="green"
              className="flex-1 flex items-center gap-2 text-black-deep"
              onClick={() => setShowShareModal(true)}
            >
              <Share2 className="w-4 h-4" />
              Compartir
            </GlassmorphismButton>
            <GlassmorphismButton
              variant="default"
              className="flex-1 text-black-deep"
              onClick={onClose}
            >
              Cerrar
            </GlassmorphismButton>
          </div>
        </div>
      </div>
      
      <ShareMatchModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        match={match}
      />
    </div>
  );
};