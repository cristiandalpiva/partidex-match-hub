import React, { useState } from 'react';
import { X, CreditCard, DollarSign } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  match?: any;
}

export const PaymentConfigModal = ({ isOpen, onClose, match }: PaymentConfigModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: '',
    method: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate payment configuration
      setTimeout(() => {
        toast({
          title: "Pago configurado",
          description: `Se configuró el pago de $${formData.amount} para el partido.`,
        });
        onClose();
        setFormData({ amount: '', method: '', notes: '' });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo configurar el pago.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-2xl shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Dashboard de Pagos</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Payment Methods Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Métodos de Pago Configurados</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">Tarjeta terminada en ****4567</span>
                </div>
                <span className="text-sm text-green-600">Activo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <span className="font-medium">MercadoPago</span>
                </div>
                <span className="text-sm text-green-600">Activo</span>
              </div>
            </div>
            <GlassmorphismButton variant="default" size="sm" className="mt-3">
              Configurar Métodos de Pago
            </GlassmorphismButton>
          </div>

          {/* Completed Payments Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Pagos Realizados</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div>
                  <p className="font-medium text-foreground">Partido en Cancha Central</p>
                  <p className="text-sm text-muted-foreground">15 de Enero, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">$2,500</p>
                  <p className="text-sm text-green-600">Pagado</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div>
                  <p className="font-medium text-foreground">Partido en Club Atlético</p>
                  <p className="text-sm text-muted-foreground">8 de Enero, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">$3,000</p>
                  <p className="text-sm text-green-600">Pagado</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Payments Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Pagos Pendientes</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                <div>
                  <p className="font-medium text-foreground">Partido en Estadio Norte</p>
                  <p className="text-sm text-muted-foreground">22 de Enero, 2024</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-yellow-600">$2,800</p>
                  <p className="text-sm text-yellow-600">Pendiente</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-3">
              Tienes 1 pago pendiente por un total de $2,800
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <GlassmorphismButton
              variant="default"
              className="flex-1"
              onClick={onClose}
            >
              Cerrar
            </GlassmorphismButton>
          </div>
        </div>
      </div>
    </div>
  );
};