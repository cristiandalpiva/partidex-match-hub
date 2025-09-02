import React, { useState } from 'react';
import { X, Share2, Link, MessageCircle, Copy, CheckCircle } from 'lucide-react';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface ShareTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: {
    id: string;
    name: string;
    inviteCode?: string;
  };
}

export const ShareTeamModal = ({ isOpen, onClose, team }: ShareTeamModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const inviteUrl = `${window.location.origin}/join-team/${team.inviteCode || team.id}`;
  const inviteMessage = `¡Te invito a unirte al equipo "${team.name}"! Usa este enlace: ${inviteUrl}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(inviteMessage)}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "¡Copiado!",
        description: "El enlace se copió al portapapeles",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo copiar el enlace",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-background rounded-3xl p-6 w-full max-w-md shadow-xl border" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-xl flex items-center justify-center">
              <Share2 className="w-6 h-6 text-black-deep" />
            </div>
            <h2 className="text-xl font-bold text-foreground">Compartir Equipo</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">{team.name}</h3>
            <p className="text-sm text-muted-foreground">
              Comparte este enlace para que otros se unan a tu equipo
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inviteUrl">Enlace de invitación</Label>
            <div className="flex gap-2">
              <Input
                id="inviteUrl"
                value={inviteUrl}
                readOnly
                className="flex-1"
              />
              <GlassmorphismButton
                variant="default"
                size="sm"
                onClick={() => copyToClipboard(inviteUrl)}
                icon={copied ? CheckCircle : Copy}
              >
                {copied ? 'Copiado' : 'Copiar'}
              </GlassmorphismButton>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium text-foreground">Compartir por:</h4>
            
            <div className="grid grid-cols-2 gap-3">
              <GlassmorphismButton
                variant="green"
                className="flex items-center gap-2"
                onClick={() => window.open(whatsappUrl, '_blank')}
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp
              </GlassmorphismButton>
              
              <GlassmorphismButton
                variant="default"
                className="flex items-center gap-2"
                onClick={() => copyToClipboard(inviteMessage)}
              >
                <Copy className="w-4 h-4" />
                Copiar mensaje
              </GlassmorphismButton>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">
              <strong>Código de equipo:</strong> {team.inviteCode || team.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Los jugadores también pueden usar este código para unirse al equipo
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