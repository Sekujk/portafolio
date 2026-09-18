import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Ingresa tu email y contraseña' };
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: 'Email o contraseña incorrectos' };
      }

      return { success: true };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error al iniciar sesión' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      if (!currentPassword || !newPassword) {
        return { success: false, error: 'Complete todos los campos' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        return { success: false, error: 'No hay sesión activa' };
      }

      // Reautenticar con la contraseña actual antes de cambiarla
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (reauthError) {
        return { success: false, error: 'Contraseña actual incorrecta' };
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        throw new Error(updateError.message);
      }

      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      console.error('ERROR al cambiar contraseña:', error);
      return { success: false, error: error.message || 'Error al cambiar la contraseña' };
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    changePassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
