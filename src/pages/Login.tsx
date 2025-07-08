
import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { AuthLayout } from '@/components/ui/auth-layout';
import { RoleSelector } from '@/components/ui/role-selector';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<'player' | 'admin' | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Auth attempt:', { ...formData, role: selectedRole, isLogin });
    
    // Mock authentication - redirect based on role
    if (selectedRole === 'player') {
      navigate('/player/dashboard');
    } else if (selectedRole === 'admin') {
      navigate('/admin/dashboard');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <AuthLayout 
      title={isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
      subtitle={isLogin ? 'Bienvenido de vuelta' : 'Únete a la comunidad'}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Role Selection */}
        <RoleSelector 
          selectedRole={selectedRole}
          onRoleSelect={setSelectedRole}
        />

        {/* Name Field (Register only) */}
        {!isLogin && (
          <div className="slide-up">
            <label className="block text-sm font-medium text-foreground mb-2">
              Nombre completo
            </label>
            <div className="relative">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Tu nombre completo"
                className="w-full px-4 py-3 pl-12 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-premium/50 transition-colors"
                required={!isLogin}
              />
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>
        )}

        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Correo electrónico
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="tu@email.com"
              className="w-full px-4 py-3 pl-12 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-premium/50 transition-colors"
              required
            />
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 pl-12 pr-12 bg-background/50 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-gold-premium/50 transition-colors"
              required
            />
            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <GlassmorphismButton
          type="submit"
          variant="gold"
          size="lg"
          className="w-full"
          disabled={!selectedRole}
        >
          {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
        </GlassmorphismButton>

        {/* Toggle Auth Mode */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-muted-foreground hover:text-gold-premium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Forgot Password (Login only) */}
        {isLogin && (
          <div className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-gold-premium transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}
      </form>
    </AuthLayout>
  );
};

export default Login;
