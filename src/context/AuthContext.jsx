import React, { createContext, useContext, useState, useEffect } from 'react';
import bcrypt from 'bcryptjs';
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
    // Verificar si hay sesión activa
    const authToken = sessionStorage.getItem('authToken');
    const authExpiry = sessionStorage.getItem('authExpiry');
    
    if (authToken && authExpiry) {
      const now = new Date().getTime();
      if (now < parseInt(authExpiry)) {
        setIsAuthenticated(true);
      } else {
        // Token expirado
        sessionStorage.removeItem('authToken');
        sessionStorage.removeItem('authExpiry');
      }
    }
    setIsLoading(false);
  }, []);

  // Obtener hash de contraseña SOLO desde Supabase
  const getPasswordHash = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_auth')
        .select('password_hash')
        .eq('user_id', 'default')
        .single();

      if (error) {
        throw new Error('No se pudo obtener la contraseña desde Supabase. Verifica tu conexión y que ejecutaste el script SQL.');
      }

      if (!data?.password_hash) {
        throw new Error('No hay contraseña configurada en Supabase. Ejecuta el script SQL primero.');
      }

      return data.password_hash;
    } catch (error) {
      console.error('❌ ERROR DE CONEXIÓN A SUPABASE:', error);
      throw error;
    }
  };

  const login = async (password) => {
    try {
      // Validar que la contraseña no esté vacía
      if (!password || password.trim() === '') {
        return { success: false, error: 'Por favor ingrese una contraseña' };
      }

      // Obtener hash desde Supabase (SIN FALLBACK)
      const storedHash = await getPasswordHash();
      
      // Verificar contraseña con bcrypt
      const isValid = await bcrypt.compare(password, storedHash);
      
      if (isValid) {
        // Generar token de sesión
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
        const expiry = new Date().getTime() + (2 * 60 * 60 * 1000); // 2 horas
        
        sessionStorage.setItem('authToken', token);
        sessionStorage.setItem('authExpiry', expiry.toString());
        setIsAuthenticated(true);
        
        console.log('✅ Login exitoso');
        return { success: true };
      } else {
        console.log('❌ Contraseña incorrecta');
        return { success: false, error: 'Contraseña incorrecta' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: 'Error al verificar la contraseña' };
    }
  };

  const logout = () => {
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('authExpiry');
    setIsAuthenticated(false);
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      // Validaciones
      if (!currentPassword || !newPassword) {
        return { success: false, error: 'Complete todos los campos' };
      }

      if (newPassword.length < 6) {
        return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres' };
      }

      // Verificar contraseña actual
      const storedHash = await getPasswordHash();
      const isValid = await bcrypt.compare(currentPassword, storedHash);
      
      if (!isValid) {
        return { success: false, error: 'Contraseña actual incorrecta' };
      }

      // Generar nuevo hash con 10 rondas de salt
      const newHash = await bcrypt.hash(newPassword, 10);
      
      // Guardar SOLO en Supabase
      const { error } = await supabase
        .from('admin_auth')
        .update({ password_hash: newHash })
        .eq('user_id', 'default');

      if (error) {
        throw new Error('No se pudo actualizar la contraseña en Supabase: ' + error.message);
      }
      
      console.log('✅ Contraseña actualizada en Supabase');
      
      return { success: true, message: 'Contraseña actualizada correctamente' };
    } catch (error) {
      console.error('❌ ERROR al cambiar contraseña:', error);
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
