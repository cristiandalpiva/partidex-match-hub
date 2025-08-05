
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
    
    // Validate role selection ONLY for signup, not login
    if (!isLogin && !selectedRole) {
      toast({
        title: "Selecciona tu rol",
        description: "Por favor selecciona si eres Jugador o Administrador de Cancha para crear tu cuenta",
        variant: "destructive"
      });
      return;
    }

    // Validate form data
    if (!formData.email || !formData.password) {
      toast({
        title: "Campos incompletos",
        description: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    if (!isLogin && !formData.name) {
      toast({
        title: "Nombre requerido",
        description: "Por favor ingresa tu nombre completo",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (isLogin) {
        // Clean up any existing auth state
        try {
          await supabase.auth.signOut({ scope: 'global' });
        } catch (cleanupError) {
          console.log('Cleanup error (ignorable):', cleanupError);
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        if (data.user) {
          toast({
            title: "¡Bienvenido!",
            description: "Iniciando sesión...",
          });

          // Get user profile to check role
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();

          // Navigate based on role, with fallback for role mismatch
          if (profile?.role === 'player') {
            window.location.href = '/player/dashboard';
          } else if (profile?.role === 'admin') {
            window.location.href = '/admin/dashboard';
          } else {
            // Handle case where profile role doesn't match selected role
            toast({
              title: "Rol incorrecto",
              description: `Tu cuenta está registrada como ${profile?.role || 'desconocido'}. Selecciona el rol correcto.`,
              variant: "destructive"
            });
            setLoading(false);
            return;
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
            title: "¡Cuenta creada exitosamente!",
            description: "Revisa tu email para confirmar tu cuenta. Luego podrás iniciar sesión.",
          });
          
          // Switch to login mode after successful signup
          setIsLogin(true);
          setFormData({ email: formData.email, password: '', name: '' });
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      let errorMessage = error.message;
      
      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email o contraseña incorrectos. Verifica tus datos.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Por favor confirma tu email antes de iniciar sesión.';
      } else if (error.message.includes('User already registered')) {
        errorMessage = 'Este email ya está registrado. Intenta iniciar sesión.';
      }
      
      toast({
        title: "Error de autenticación",
        description: errorMessage,
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
        {/* Role Selection - Only required for signup */}
        {!isLogin && (
          <div className={`${!selectedRole ? 'ring-2 ring-destructive/50 rounded-xl p-2' : ''}`}>
            <RoleSelector 
              selectedRole={selectedRole}
              onRoleSelect={setSelectedRole}
            />
            {!selectedRole && (
              <p className="text-sm text-destructive mt-2 text-center">
                ⚠️ Selecciona tu rol para crear tu cuenta
              </p>
            )}
          </div>
        )}

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
          disabled={(!isLogin && !selectedRole) || loading}
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
