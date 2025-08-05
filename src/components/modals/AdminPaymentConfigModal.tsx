import React, { useState } from 'react';
import { X, CreditCard, MapPin, QrCode, Plus, Settings, Building2 } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface AdminPaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPaymentConfigModal = ({ isOpen, onClose }: AdminPaymentConfigModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    location: '',
    method: '',
    details: '',
    qrCode: '',
    bankAccount: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Simulate payment location configuration
      setTimeout(() => {
        toast({
          title: "Ubicación de pagos configurada",
          description: `Se configuró la ubicación para recibir pagos: ${formData.location}`,
        });
        onClose();
        setFormData({ location: '', method: '', details: '', qrCode: '', bankAccount: '' });
        setLoading(false);
      }, 1000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo configurar la ubicación de pagos.",
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
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-black-deep" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Configurar Lugar de Pagos</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Current Payment Locations */}
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-3">Ubicaciones Configuradas</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Cancha Central - Oficina</span>
                    <p className="text-sm text-muted-foreground">Calle 123 #45-67, Local 2</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Activo</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <div className="flex items-center gap-3">
                  <QrCode className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <span className="font-medium">Código QR - Nequi</span>
                    <p className="text-sm text-muted-foreground">Disponible en la entrada</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">Activo</span>
              </div>
            </div>
          </div>

          {/* Configuration Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="glass rounded-2xl p-4">
              <h3 className="font-semibold text-foreground mb-3">Agregar Nueva Ubicación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación física</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Ej: Oficina de la cancha, Caja..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="method">Método de pago</Label>
                  <Select value={formData.method} onValueChange={(value) => setFormData(prev => ({ ...prev, method: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona método" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="transfer">Transferencia bancaria</SelectItem>
                      <SelectItem value="qr">Código QR (Nequi/Daviplata)</SelectItem>
                      <SelectItem value="pos">Terminal POS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 mt-4">
                <Label htmlFor="details">Detalles adicionales</Label>
                <Textarea
                  id="details"
                  value={formData.details}
                  onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                  placeholder="Horarios de atención, instrucciones especiales, etc."
                  rows={3}
                />
              </div>

              {formData.method === 'transfer' && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="bankAccount">Datos bancarios</Label>
                  <Input
                    id="bankAccount"
                    value={formData.bankAccount}
                    onChange={(e) => setFormData(prev => ({ ...prev, bankAccount: e.target.value }))}
                    placeholder="Banco, número de cuenta, titular..."
                  />
                </div>
              )}

              {formData.method === 'qr' && (
                <div className="space-y-2 mt-4">
                  <Label htmlFor="qrCode">Código QR</Label>
                  <Input
                    id="qrCode"
                    value={formData.qrCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, qrCode: e.target.value }))}
                    placeholder="Link del código QR o número de teléfono"
                  />
                </div>
              )}
            </div>

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
                variant="gold"
                className="flex-1"
                disabled={loading || !formData.location || !formData.method}
                icon={loading ? undefined : Plus}
              >
                {loading ? 'Guardando...' : 'Agregar Ubicación'}
              </GlassmorphismButton>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};