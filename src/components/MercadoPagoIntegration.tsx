import React, { useState } from 'react';
import { CreditCard, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface MercadoPagoIntegrationProps {
  amount: number;
  description: string;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
}

export const MercadoPagoIntegration = ({ 
  amount, 
  description, 
  onPaymentSuccess, 
  onPaymentError 
}: MercadoPagoIntegrationProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    email: '',
    document: ''
  });

  const [paymentMethods] = useState([
    {
      id: 'mercadopago',
      name: 'MercadoPago',
      icon: DollarSign,
      description: 'Pago seguro con MercadoPago',
      available: true
    },
    {
      id: 'debit_card',
      name: 'Tarjeta de Débito',
      icon: CreditCard,
      description: 'Visa, Mastercard, etc.',
      available: true
    },
    {
      id: 'bank_transfer',
      name: 'Transferencia Bancaria',
      icon: CheckCircle,
      description: 'CBU o Alias',
      available: true
    }
  ]);

  const [selectedMethod, setSelectedMethod] = useState('mercadopago');

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulate MercadoPago payment process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful payment
      const paymentData = {
        id: `mp_${Date.now()}`,
        status: 'approved',
        amount: amount,
        method: selectedMethod,
        transaction_id: `TXN_${Date.now()}`,
        created_at: new Date().toISOString()
      };

      onPaymentSuccess(paymentData);
      
      toast({
        title: "¡Pago exitoso!",
        description: `Se procesó el pago de $${amount.toLocaleString()} ARS`,
      });

    } catch (error) {
      const errorMessage = "Error al procesar el pago. Intenta nuevamente.";
      onPaymentError(errorMessage);
      
      toast({
        title: "Error en el pago",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (selectedMethod === 'debit_card') {
      return cardData.number.length >= 16 && 
             cardData.expiry.length >= 5 && 
             cardData.cvv.length >= 3 && 
             cardData.name.length > 0;
    }
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Payment Summary */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold text-foreground mb-3">Resumen del Pago</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Concepto:</span>
            <span className="text-foreground">{description}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Monto:</span>
            <span className="text-2xl font-bold text-green-dynamic">
              ${amount.toLocaleString()} ARS
            </span>
          </div>
        </div>
      </div>

      {/* Payment Methods */}
      <div className="glass rounded-2xl p-4">
        <h3 className="font-semibold text-foreground mb-4">Método de Pago</h3>
        <div className="space-y-3">
          {paymentMethods.map((method) => {
            const Icon = method.icon;
            return (
              <label key={method.id} className="cursor-pointer">
                <div className={`p-3 rounded-lg border transition-all ${
                  selectedMethod === method.id 
                    ? 'border-green-dynamic bg-green-dynamic/5' 
                    : 'border-border hover:border-green-dynamic/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payment_method"
                      value={method.id}
                      checked={selectedMethod === method.id}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="text-green-dynamic"
                    />
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{method.name}</p>
                      <p className="text-sm text-muted-foreground">{method.description}</p>
                    </div>
                    {method.available && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        Disponible
                      </Badge>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Card Details (if debit card selected) */}
      {selectedMethod === 'debit_card' && (
        <div className="glass rounded-2xl p-4">
          <h3 className="font-semibold text-foreground mb-4">Datos de la Tarjeta</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="card_number">Número de Tarjeta</Label>
                <Input
                  id="card_number"
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    number: formatCardNumber(e.target.value) 
                  }))}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                />
              </div>
              <div>
                <Label htmlFor="expiry">Vencimiento</Label>
                <Input
                  id="expiry"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    expiry: formatExpiry(e.target.value) 
                  }))}
                  placeholder="MM/AA"
                  maxLength={5}
                />
              </div>
              <div>
                <Label htmlFor="cvv">CVV</Label>
                <Input
                  id="cvv"
                  type="password"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    cvv: e.target.value.replace(/\D/g, '') 
                  }))}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="card_name">Nombre en la Tarjeta</Label>
              <Input
                id="card_name"
                value={cardData.name}
                onChange={(e) => setCardData(prev => ({ 
                  ...prev, 
                  name: e.target.value.toUpperCase() 
                }))}
                placeholder="JUAN PÉREZ"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cardData.email}
                  onChange={(e) => setCardData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@ejemplo.com"
                />
              </div>
              <div>
                <Label htmlFor="document">DNI</Label>
                <Input
                  id="document"
                  value={cardData.document}
                  onChange={(e) => setCardData(prev => ({ 
                    ...prev, 
                    document: e.target.value.replace(/\D/g, '') 
                  }))}
                  placeholder="12345678"
                  maxLength={8}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Notice */}
      <div className="glass rounded-2xl p-4 border-l-4 border-green-dynamic">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-dynamic mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Pago Seguro</h4>
            <p className="text-sm text-muted-foreground">
              {selectedMethod === 'mercadopago' 
                ? 'Procesado de forma segura a través de MercadoPago. Tus datos están protegidos con encriptación de nivel bancario.'
                : selectedMethod === 'debit_card'
                ? 'Tu información de tarjeta está protegida con encriptación SSL. No almacenamos tus datos de pago.'
                : 'Transferencia bancaria segura. Recibirás los datos de cuenta para completar el pago.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="pt-4">
        <GlassmorphismButton
          variant="green"
          size="lg"
          onClick={handlePayment}
          disabled={loading || !validateForm()}
          className="w-full"
          icon={loading ? undefined : CheckCircle}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Procesando pago...
            </div>
          ) : (
            `Pagar $${amount.toLocaleString()} ARS`
          )}
        </GlassmorphismButton>
      </div>

      {/* Help Text */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          Al proceder con el pago, aceptas nuestros términos y condiciones.
          {selectedMethod === 'mercadopago' && (
            <> También se aplicarán los términos de servicio de MercadoPago.</>
          )}
        </p>
      </div>
    </div>
  );
};