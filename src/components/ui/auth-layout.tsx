
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
          <div className="w-16 h-16 bg-gradient-to-br from-gold-premium to-gold-premium-light rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-gold">
            <svg className="w-8 h-8 text-black-deep" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
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
