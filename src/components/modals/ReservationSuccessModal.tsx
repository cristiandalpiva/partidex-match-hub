import React from 'react';
import { CheckCircle2, Calendar, MapPin, Users, DollarSign } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';

interface ReservationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationData: {
    matchId: string;
    teamName: string;
    fieldName: string;
    fieldLocation: string;
    dateTime: string;
    amount: number;
    paymentMethod: string;
  };
}

export const ReservationSuccessModal = ({ 
  isOpen, 
  onClose, 
  reservationData 
}: ReservationSuccessModalProps) => {
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

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-3xl p-8 w-full max-w-md shadow-2xl border-2 border-green-dynamic/20" onClick={(e) => e.stopPropagation()}>
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">¡Reserva Confirmada!</h2>
          <p className="text-muted-foreground">Tu seña ha sido registrada exitosamente</p>
        </div>

        <div className="space-y-4 mb-6">
          <div className="glass rounded-2xl p-4 border border-green-dynamic/10">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-dynamic" />
              Detalles del Partido
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground font-medium">{reservationData.teamName}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <div>
                  <p className="text-foreground font-medium">{reservationData.fieldName}</p>
                  <p className="text-xs text-muted-foreground">{reservationData.fieldLocation}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-foreground">{formatDate(reservationData.dateTime)}</span>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-4 border border-green-dynamic/10">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-dynamic" />
              Información de Pago
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Seña confirmada:</span>
                <span className="text-foreground font-bold text-green-dynamic">${reservationData.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Método de pago:</span>
                <span className="text-foreground font-medium">{reservationData.paymentMethod}</span>
              </div>
              <div className="bg-green-dynamic/10 rounded-lg p-2 mt-3">
                <p className="text-xs text-green-dynamic font-medium">
                  ✅ Pago procesado y confirmado
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-blue-dynamic/10 rounded-lg p-3">
            <p className="text-xs text-blue-dynamic font-medium text-center">
              📱 Recibirás notificaciones sobre el partido en tu dashboard
            </p>
          </div>
          
          <GlassmorphismButton
            variant="green"
            className="w-full"
            onClick={onClose}
          >
            ¡Perfecto! Ir al Dashboard
          </GlassmorphismButton>
        </div>
      </div>
    </div>
  );
};