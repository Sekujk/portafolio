import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../config/supabase';

const PortfolioContext = createContext();

export const usePortfolio = () => {
  const context = useContext(PortfolioContext);
  if (!context) {
    throw new Error('usePortfolio debe usarse dentro de PortfolioProvider');
  }
  return context;
};

export const PortfolioProvider = ({ children }) => {
  const [portfolioData, setPortfolioData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recordId, setRecordId] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  // Cargar datos desde Supabase al iniciar
  useEffect(() => {
    loadPortfolioData();
  }, []);

  const loadPortfolioData = async () => {
    try {
      setIsLoading(true);
      setConnectionError(null);
      
      // Buscar el registro del usuario
      const { data, error } = await supabase
        .from('portfolio_data')
        .select('*')
        .eq('user_id', 'default')
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No existe registro, debe ejecutar el SQL primero
          throw new Error('NO HAY DATOS EN SUPABASE. Ejecuta el script SQL primero en Supabase Dashboard.');
        } else {
          throw error;
        }
      }
      
      if (!data) {
        throw new Error('NO SE ENCONTRARON DATOS. Verifica que ejecutaste el script SQL.');
      }

      setRecordId(data.id);
      setPortfolioData(data.data);
      console.log('✅ Datos cargados desde Supabase');
    } catch (error) {
      console.error('❌ ERROR DE CONEXIÓN A SUPABASE:', error);
      setConnectionError(error.message || 'No se pudo conectar a Supabase. Verifica tu configuración.');
      setPortfolioData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Guardar datos en Supabase (SIN FALLBACK)
  const savePortfolioData = async (newData) => {
    if (!recordId) {
      throw new Error('No hay conexión a Supabase. No se puede guardar.');
    }
    
    setIsLoading(true);
    try {
      const updatedData = { ...portfolioData, ...newData };
      
      // Actualizar registro existente
      const { error } = await supabase
        .from('portfolio_data')
        .update({ data: updatedData })
        .eq('id', recordId);

      if (error) throw error;
      
      setPortfolioData(updatedData);
      console.log('✅ Datos guardados en Supabase');
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      console.error('❌ ERROR AL GUARDAR EN SUPABASE:', error);
      setIsLoading(false);
      throw new Error('No se pudo guardar en Supabase: ' + error.message);
    }
  };

  // Actualizar sección específica
  const updateSection = (section, data) => {
    return savePortfolioData({ [section]: data });
  };

  // Agregar item a una lista (proyectos, experiencia, etc.)
  const addItem = (section, item) => {
    if (!portfolioData) throw new Error('No hay datos cargados');
    const currentItems = portfolioData[section] || [];
    const newItem = {
      ...item,
      id: Date.now().toString()
    };
    return updateSection(section, [...currentItems, newItem]);
  };

  // Actualizar item existente
  const updateItem = (section, itemId, updatedItem) => {
    if (!portfolioData) throw new Error('No hay datos cargados');
    const currentItems = portfolioData[section] || [];
    const updatedItems = currentItems.map(item =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    );
    return updateSection(section, updatedItems);
  };

  // Eliminar item
  const deleteItem = (section, itemId) => {
    if (!portfolioData) throw new Error('No hay datos cargados');
    const currentItems = portfolioData[section] || [];
    const filteredItems = currentItems.filter(item => item.id !== itemId);
    return updateSection(section, filteredItems);
  };

  // Resetear se debe hacer manualmente ejecutando el SQL de nuevo
  const resetToDefaults = async () => {
    throw new Error('Para resetear los datos, ejecuta el script SQL nuevamente en Supabase Dashboard.');
  };

  const value = {
    portfolioData,
    isLoading,
    connectionError,
    savePortfolioData,
    updateSection,
    addItem,
    updateItem,
    deleteItem,
    resetToDefaults
  };

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  );
};
