import React, { useState, useEffect } from 'react';
import { X, CreditCard, DollarSign, Plus, Settings, Trash2, Wallet } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { MercadoPagoIntegration } from '@/components/MercadoPagoIntegration';

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  onUpdate?: () => void;
}

export const PaymentConfigModal = ({ isOpen, onClose, userId, onUpdate }: PaymentConfigModalProps) => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [pendingPayments, setPendingPayments] = useState([]);
  const [completedPayments, setCompletedPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [showMercadoPago, setShowMercadoPago] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      loadPaymentData();
    }
  }, [isOpen, userId]);

  const loadPaymentData = async () => {
    try {
      setLoading(true);
      
      // Load payment methods
      const { data: methods } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (methods) setPaymentMethods(methods);

      // Load payments
      const { data: payments } = await supabase
        .from('payments')
        .select(`
          *,
          matches(
            id,
            date_time,
            fields(name, location),
            teams(name)
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (payments) {
        setPendingPayments(payments.filter(p => p.status === 'pending'));
        setCompletedPayments(payments.filter(p => p.status === 'paid'));
      }
    } catch (error) {
      console.error('Error loading payment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('create-setup-intent', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      if (error) throw error;

      // In a real implementation, you would use Stripe Elements here
      toast({
        title: "Función disponible pronto",
        description: "La integración completa con Stripe estará disponible en breve.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo agregar el método de pago.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePaymentMethod = async (methodId: string) => {
    try {
      const { error } = await supabase
        .from('payment_methods')
        .delete()
        .eq('id', methodId)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Método eliminado",
        description: "El método de pago fue eliminado exitosamente.",
      });
      
      loadPaymentData();
      if (onUpdate) onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el método de pago.",
        variant: "destructive",
      });
    }
  };

  const handlePayPendingPayment = async (paymentId: string, amount: number) => {
    try {
      if (paymentMethods.length === 0) {
        toast({
          title: "Sin métodos de pago",
          description: "Primero debes agregar un método de pago.",
          variant: "destructive",
        });
        return;
      }

      // In a real implementation, this would process the payment through Stripe
      toast({
        title: "Función disponible pronto",
        description: "El procesamiento de pagos estará disponible en breve.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo procesar el pago.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    onClose();
    if (onUpdate) onUpdate();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4" onClick={handleClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Dashboard de Pagos</h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Payment Methods Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Métodos de Pago</h3>
            {paymentMethods.length > 0 ? (
              <div className="space-y-3">
                {paymentMethods.map((method: any) => (
                  <div key={method.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <span className="font-medium capitalize">{method.brand} terminada en ****{method.last4}</span>
                        <p className="text-sm text-muted-foreground">
                          Expira {method.exp_month.toString().padStart(2, '0')}/{method.exp_year}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {method.is_default && (
                        <span className="text-xs bg-green-dynamic/20 text-green-dynamic px-2 py-1 rounded-full">
                          Predeterminado
                        </span>
                      )}
                      <GlassmorphismButton
                        variant="default"
                        size="sm"
                        icon={Trash2}
                        onClick={() => handleDeletePaymentMethod(method.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </GlassmorphismButton>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-muted-foreground mb-4">No tienes métodos de pago configurados</p>
                <p className="text-sm text-muted-foreground">Agrega un método de pago para poder realizar reservas</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <GlassmorphismButton 
                variant="green" 
                size="sm" 
                icon={Plus}
                onClick={handleAddPaymentMethod}
                disabled={loading}
              >
                Agregar Tarjeta
              </GlassmorphismButton>
              <GlassmorphismButton 
                variant="default" 
                size="sm" 
                icon={Wallet}
                onClick={() => setShowMercadoPago(true)}
                disabled={loading}
              >
                MercadoPago
              </GlassmorphismButton>
            </div>
          </div>

          {/* Completed Payments Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Pagos Realizados</h3>
            {completedPayments.length > 0 ? (
              <div className="space-y-3">
                {completedPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.matches?.teams?.name || 'Partido'} - {payment.matches?.fields?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.paid_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">${payment.amount}</p>
                      <p className="text-sm text-green-600">Pagado</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No tienes pagos realizados</p>
            )}
          </div>

          {/* Pending Payments Section */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Pagos Pendientes</h3>
            {pendingPayments.length > 0 ? (
              <div className="space-y-3">
                {pendingPayments.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <p className="font-medium text-foreground">
                        {payment.matches?.teams?.name || 'Partido'} - {payment.matches?.fields?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(payment.matches?.date_time).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right flex items-center gap-2">
                      <div>
                        <p className="font-semibold text-yellow-600">${payment.amount}</p>
                        <p className="text-sm text-yellow-600">Pendiente</p>
                      </div>
                      <GlassmorphismButton
                        variant="gold"
                        size="sm"
                        onClick={() => handlePayPendingPayment(payment.id, payment.amount)}
                        disabled={loading}
                      >
                        Pagar
                      </GlassmorphismButton>
                    </div>
                  </div>
                ))}
                <p className="text-sm text-muted-foreground mt-3">
                  Tienes {pendingPayments.length} pago{pendingPayments.length !== 1 ? 's' : ''} pendiente{pendingPayments.length !== 1 ? 's' : ''} por un total de ${pendingPayments.reduce((sum: number, p: any) => sum + p.amount, 0)}
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No tienes pagos pendientes</p>
            )}
          </div>

          {/* MercadoPago Integration */}
          {showMercadoPago && (
            <div className="glass rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Configurar MercadoPago</h3>
                <button
                  onClick={() => setShowMercadoPago(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div className="p-4 rounded-lg border border-border bg-muted/20">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">MercadoPago</h3>
                      <p className="text-xs text-muted-foreground">Método de pago popular en Argentina</p>
                    </div>
                  </div>
                  
                  <GlassmorphismButton
                    variant="green"
                    className="w-full"
                    onClick={() => {
                      toast({
                        title: "Integración en desarrollo",
                        description: "La integración con MercadoPago estará disponible pronto.",
                      });
                      setShowMercadoPago(false);
                    }}
                    icon={Wallet}
                  >
                    Configurar MercadoPago
                  </GlassmorphismButton>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <GlassmorphismButton
              variant="default"
              className="flex-1"
              onClick={handleClose}
            >
              Cerrar
            </GlassmorphismButton>
          </div>
        </div>
      </div>
    </div>
  );
};