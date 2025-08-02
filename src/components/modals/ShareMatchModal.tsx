import React, { useState } from 'react';
import { X, Copy, MessageCircle, CheckCircle } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { useToast } from '@/hooks/use-toast';

interface ShareMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  match: any;
}

export const ShareMatchModal = ({ isOpen, onClose, match }: ShareMatchModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const matchUrl = `${window.location.origin}/match/${match.id}`;
  const whatsappMessage = `¡Te invito a jugar fútbol! 🏈\n\nPartido: ${match.teams?.name || 'Equipo'}\nFecha: ${new Date(match.date_time).toLocaleDateString('es-ES')}\nCancha: ${match.fields?.name || 'N/A'}\nUbicación: ${match.fields?.location || 'N/A'}\n\n¡Únete aquí: ${matchUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(matchUrl);
      setCopied(true);
      toast({
        title: "¡Enlace copiado!",
        description: "El enlace del partido se copió al portapapeles"
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-dynamic to-green-dynamic-dark rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Compartir Partido</h2>
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
            <h3 className="font-semibold text-foreground mb-2">Información del Partido</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p><span className="font-medium">Equipo:</span> {match.teams?.name || 'N/A'}</p>
              <p><span className="font-medium">Fecha:</span> {new Date(match.date_time).toLocaleDateString('es-ES')}</p>
              <p><span className="font-medium">Hora:</span> {new Date(match.date_time).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
              <p><span className="font-medium">Cancha:</span> {match.fields?.name || 'N/A'}</p>
              <p><span className="font-medium">Ubicación:</span> {match.fields?.location || 'N/A'}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 p-3 rounded-lg border border-border bg-muted/20">
              <div className="flex-1 text-sm text-muted-foreground truncate">{matchUrl}</div>
              <GlassmorphismButton
                variant="green"
                size="sm"
                onClick={copyToClipboard}
                className="shrink-0"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </GlassmorphismButton>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <GlassmorphismButton
                variant="default"
                onClick={copyToClipboard}
                className="flex items-center gap-2"
              >
                <Copy className="w-4 h-4" />
                Copiar Enlace
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="green"
                onClick={() => window.open(whatsappUrl, '_blank')}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </GlassmorphismButton>
            </div>
          </div>

          <GlassmorphismButton
            variant="default"
            className="w-full"
            onClick={onClose}
          >
            Cerrar
          </GlassmorphismButton>
        </div>
      </div>
    </div>
  );
};