import React, { useState, useEffect } from 'react';
import { X, MapPin, DollarSign, Camera, Navigation } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditFieldModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldUpdated: () => void;
  field: {
    id: string;
    name: string;
    location: string;
    price: number;
    photo_url?: string;
    city?: string;
    address?: string;
  } | null;
}

export const EditFieldModal = ({ isOpen, onClose, onFieldUpdated, field }: EditFieldModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    price: '',
    photo_url: '',
    city: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (field) {
      setFormData({
        name: field.name || '',
        location: field.location || '',
        price: field.price?.toString() || '',
        photo_url: field.photo_url || '',
        city: field.city || '',
        address: field.address || ''
      });
    }
  }, [field]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!field || !formData.name.trim() || !formData.location.trim() || !formData.price) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('fields')
        .update({
          name: formData.name.trim(),
          location: formData.location.trim(),
          price: parseFloat(formData.price),
          photo_url: formData.photo_url.trim() || null,
          city: formData.city.trim() || null,
          address: formData.address.trim() || null
        })
        .eq('id', field.id);

      if (error) throw error;

      toast({
        title: "¡Cancha actualizada!",
        description: `${formData.name} ha sido actualizada exitosamente.`,
      });

      onFieldUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating field:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la cancha. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !field) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-black-deep" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Editar Cancha</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-gray-900">Nombre de la cancha</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Ej: Cancha Principal"
              required
              className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location" className="text-gray-900">Ubicación</Label>
            <div className="space-y-2">
              <Textarea
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Dirección completa de la cancha"
                required
                rows={3}
                className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-gray-900">Ciudad (opcional)</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
              placeholder="Ej: Bogotá"
              className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-gray-900">Dirección específica (opcional)</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Ej: Calle 123 #45-67"
              className="border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-900">Precio por hora (COP)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                placeholder="80000"
                required
                min="0"
                step="1000"
                className="pl-10 border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="photo_url" className="text-gray-900">URL de la foto (opcional)</Label>
            <div className="relative">
              <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input
                id="photo_url"
                type="url"
                value={formData.photo_url}
                onChange={(e) => setFormData(prev => ({ ...prev, photo_url: e.target.value }))}
                placeholder="https://ejemplo.com/foto-cancha.jpg"
                className="pl-10 border-2 border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gold-premium"
              />
            </div>
            {formData.photo_url && (
              <div className="mt-2">
                <img 
                  src={formData.photo_url} 
                  alt="Vista previa" 
                  className="w-full h-32 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              className="flex-1 px-4 py-2 bg-muted border-2 border-border text-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gold-premium border-2 border-gold-premium text-black-deep rounded-xl hover:bg-gold-premium/90 transition-colors font-medium disabled:opacity-50 flex items-center justify-center gap-2 shadow-gold"
              disabled={loading || !formData.name.trim() || !formData.location.trim() || !formData.price}
            >
              {loading ? (
                'Guardando...'
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};