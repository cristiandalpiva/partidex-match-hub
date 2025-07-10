import React, { useState } from 'react';
import { X, MapPin, DollarSign, Camera } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldAdded: () => void;
  userId: string;
}

export const AddFieldModal = ({ isOpen, onClose, onFieldAdded, userId }: AddFieldModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    photo_url: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.location.trim() || !formData.price) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fields')
        .insert({
          name: formData.name.trim(),
          location: formData.location.trim(),
          price: parseFloat(formData.price),
          photo_url: formData.photo_url.trim() || null,
          admin_id: userId
        });

      if (error) throw error;

      toast({
        title: "¡Cancha agregada!",
        description: `${formData.name} ha sido agregada exitosamente.`,
      });

      onFieldAdded();
      onClose();
      setFormData({ name: '', location: '', price: '', photo_url: '' });
    } catch (error) {
      console.error('Error adding field:', error);
      toast({
        title: "Error",
        description: "No se pudo agregar la cancha. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-black-deep" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Agregar Cancha</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre de la cancha</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Cancha Principal"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Ubicación</Label>
            <Textarea
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Dirección completa de la cancha"
              required
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio por hora (COP)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="80000"
                required
                min="0"
                step="1000"
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url">URL de la foto (opcional)</Label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://ejemplo.com/foto-cancha.jpg"
                className="pl-10"
              />
            </div>
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
              disabled={loading || !formData.name.trim() || !formData.location.trim() || !formData.price}
              icon={loading ? undefined : MapPin}
            >
              {loading ? 'Agregando...' : 'Agregar Cancha'}
            </GlassmorphismButton>
          </div>
        </form>
      </div>
    </div>
  );
};