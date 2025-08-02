import React, { useState } from 'react';
import { X, MapPin, Navigation, CheckCircle } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface FieldLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: string, coordinates?: { lat: number; lng: number }) => void;
  initialLocation?: string;
}

export const FieldLocationModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialLocation = '' 
}: FieldLocationModalProps) => {
  const [location, setLocation] = useState(initialLocation);
  const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  if (!isOpen) return null;

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (!navigator.geolocation) {
      alert('La geolocalización no está disponible en tu navegador');
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates({ lat: latitude, lng: longitude });
        
        // Try to get address from coordinates using reverse geocoding
        try {
          const response = await fetch(
            `https://api.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          
          if (data.display_name) {
            setLocation(data.display_name);
          }
        } catch (error) {
          console.error('Error getting address:', error);
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
        
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert('No se pudo obtener tu ubicación actual');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = () => {
    if (!location.trim()) {
      alert('Por favor ingresa una ubicación');
      return;
    }
    
    onSave(location, coordinates || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <MapPin className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Ubicación de la Cancha</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="glass rounded-2xl p-4">
            <h3 className="font-semibold text-foreground mb-2">Instrucciones</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Ingresa la dirección completa de tu cancha</li>
              <li>• Usa el botón de ubicación actual si estás en la cancha</li>
              <li>• Incluye referencias que ayuden a los jugadores a encontrar el lugar</li>
              <li>• Una ubicación precisa mejora la visibilidad de tu cancha</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div>
              <Label htmlFor="location">Dirección de la Cancha</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, CABA, Buenos Aires"
                className="mt-1"
              />
            </div>

            <GlassmorphismButton
              variant="green"
              onClick={getCurrentLocation}
              disabled={isGettingLocation}
              className="w-full flex items-center gap-2"
            >
              {isGettingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Obteniendo ubicación...
                </>
              ) : (
                <>
                  <Navigation className="w-4 h-4" />
                  Usar mi ubicación actual
                </>
              )}
            </GlassmorphismButton>

            {coordinates && (
              <div className="flex items-center gap-2 text-sm text-green-dynamic">
                <CheckCircle className="w-4 h-4" />
                Ubicación GPS obtenida
              </div>
            )}
          </div>

          <div className="bg-blue-dynamic/10 rounded-lg p-3">
            <p className="text-xs text-blue-dynamic">
              <strong>💡 Consejo:</strong> Una ubicación precisa y detallada hace que tu cancha sea más fácil de encontrar y mejora su visibilidad en los resultados de búsqueda.
            </p>
          </div>

          <div className="flex gap-3">
            <GlassmorphismButton
              variant="default"
              className="flex-1"
              onClick={onClose}
            >
              Cancelar
            </GlassmorphismButton>
            <GlassmorphismButton
              variant="green"
              className="flex-1"
              onClick={handleSave}
            >
              Guardar Ubicación
            </GlassmorphismButton>
          </div>
        </div>
      </div>
    </div>
  );
};