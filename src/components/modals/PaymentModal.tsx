import React, { useState } from 'react';
import { X, CreditCard, DollarSign, Check } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentUpdated: () => void;
  payment: any;
  isAdmin?: boolean;
}

export const PaymentModal = ({ isOpen, onClose, onPaymentUpdated, payment, isAdmin = false }: PaymentModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    amount: payment?.amount || '',
    method: payment?.method || '',
    status: payment?.status || 'pending'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payment) return;

    setLoading(true);
    try {
      const updateData: any = {
        method: formData.method,
        status: formData.status
      };

      // If marking as paid, set paid_at timestamp
      if (formData.status === 'paid' && payment.status !== 'paid') {
        updateData.paid_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('payments')
        .update(updateData)
        .eq('id', payment.id);

      if (error) throw error;

      toast({
        title: "Pago actualizado",
        description: `El estado del pago ha sido actualizado a ${formData.status === 'paid' ? 'pagado' : formData.status}.`,
      });

      onPaymentUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.method) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('payments')
        .insert({
          match_id: payment.match_id,
          user_id: payment.user_id,
          amount: parseFloat(formData.amount),
          method: formData.method,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: "Pago registrado",
        description: "El pago ha sido registrado exitosamente.",
      });

      onPaymentUpdated();
      onClose();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el pago. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isNewPayment = !payment?.id;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="glass rounded-3xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">
              {isNewPayment ? 'Registrar Pago' : 'Gestionar Pago'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={isNewPayment ? handleCreatePayment : handleSubmit} className="space-y-6">
          {isNewPayment && (
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (COP)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="40000"
                  required
                  min="0"
                  step="1000"
                  className="pl-10"
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="method">Método de pago</Label>
            <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="qr">Código QR</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isNewPayment && isAdmin && (
            <div className="space-y-2">
              <Label htmlFor="status">Estado del pago</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                  <SelectItem value="failed">Fallido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {!isNewPayment && (
            <div className="p-4 rounded-lg bg-muted/10 border border-border">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Monto:</span>
                  <div className="font-medium text-foreground">
                    ${payment?.amount?.toLocaleString()} COP
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado actual:</span>
                  <div className={`font-medium ${
                    payment?.status === 'paid' ? 'text-green-dynamic' :
                    payment?.status === 'partial' ? 'text-gold-premium' :
                    'text-vibrant-orange'
                  }`}>
                    {payment?.status === 'paid' ? 'Pagado' :
                     payment?.status === 'partial' ? 'Parcial' :
                     payment?.status === 'pending' ? 'Pendiente' : 'Fallido'}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <GlassmorphismButton
              type="button"
              variant="default"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </GlassmorphismButton>
            <GlassmorphismButton
              type="submit"
              variant="green"
              className="flex-1"
              disabled={loading || !formData.method || (isNewPayment && !formData.amount)}
              icon={loading ? undefined : Check}
            >
              {loading ? 'Guardando...' : (isNewPayment ? 'Registrar' : 'Actualizar')}
            </GlassmorphismButton>
          </div>
        </form>
      </div>
    </div>
  );
};