
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
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C7.589 2 4 5.589 4 10c0 1.538.425 2.98 1.159 4.217L12 22l6.841-7.783C19.575 12.98 20 11.538 20 10c0-4.411-3.589-8-8-8zm0 12c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z"/>
              <circle cx="12" cy="10" r="2"/>
              <path d="M8.5 7.5L9.5 8.5M15.5 7.5L14.5 8.5M12 5.5V6.5M12 13.5V14.5M6.5 10H7.5M16.5 10H17.5"/>
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
