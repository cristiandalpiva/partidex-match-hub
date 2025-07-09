
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { AuthLayout } from '@/components/ui/auth-layout';
import { RoleSelector } from '@/components/ui/role-selector';
import { GlassmorphismButton } from '@/components/ui/glassmorphism-button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<'player' | 'admin' | null>(null);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile?.role === 'player') {
          navigate('/player/dashboard');
        } else if (profile?.role === 'admin') {
          navigate('/admin/dashboard');
        }
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          // Get user profile to check role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          if (profile?.role === 'player') {
            navigate('/player/dashboard');
          } else if (profile?.role === 'admin') {
            navigate('/admin/dashboard');
          }
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
              role: selectedRole
            },
            emailRedirectTo: `${window.location.origin}/`
          }
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "Cuenta creada exitosamente",
            description: "Revisa tu email para confirmar tu cuenta",
          });
        }
      }
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
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
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
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
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-gold-premium transition-colors tap-scale"
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
          className="w-full tap-scale disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!selectedRole || loading}
        >
          {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Crear Cuenta')}
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
