
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
}

export const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-dynamic/10 via-background to-gold-premium/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8 fade-in">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-gold">
            <img 
              src="/lovable-uploads/b26b6299-0c47-4446-8a52-82d18d2167f3.png" 
              alt="Partidex Logo" 
              className="w-16 h-16 rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold text-gradient-gold mb-2">Partidex</h1>
          <p className="text-sm text-muted-foreground">Tu mejor fichaje</p>
        </div>

        {/* Auth Card */}
        <div className="glass rounded-3xl p-8 shadow-2xl bounce-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">{title}</h2>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>
          {children}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-muted-foreground">
          <p>© 2024 Partidex. Todos los derechos reservados.</p>
        </div>
      </div>
    </div>
  );
};
